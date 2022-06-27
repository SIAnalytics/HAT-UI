import cv2
import torch
import math
import numpy as np

from torchvision.transforms.functional import F_pil
from torchvision.transforms.functional import F_t
import torchvision.transforms as transforms
import torchvision.transforms as transform
from torch import Tensor
from typing import List
from typing import Optional
from enum import Enum

class InterpolationMode(Enum):
    """Interpolation modes
    Available interpolation methods are ``nearest``, ``bilinear``, ``bicubic``, ``box``, ``hamming``, and ``lanczos``.
    """
    NEAREST = "nearest"
    BILINEAR = "bilinear"
    BICUBIC = "bicubic"
    # For PIL compatibility
    BOX = "box"
    HAMMING = "hamming"
    LANCZOS = "lanczos"

def TensorRGBToFrameBGR(tensor):
    bgr_frame = cv2.cvtColor(tensor.permute(1, 2, 0).cpu().numpy(), cv2.COLOR_RGB2BGR)

    return bgr_frame

def AdjustBrightness(img: Tensor, brightness_factor: float):
    if not isinstance(img, torch.Tensor):
        return F_pil.adjust_brightness(img, brightness_factor)
    
    return F_t.adjust_brightness(img, brightness_factor)

def AdjustContrast(img: Tensor, contrast_factor: float):
    if not isinstance(img, torch.Tensor):
        return F_pil.adjust_contrast(img, contrast_factor)

    return F_t.adjust_contrast(img, contrast_factor)

def HorizontalFlip(img: Tensor):
    if not isinstance(img, torch.Tensor):
        return F_pil.hflip(img)

    return F_t.hflip(img)

def VerticalFlip(img: Tensor):
    if not isinstance(img, torch.Tensor):
        return F_pil.vflip(img)

    return F_t.vflip(img)

def Scale(img: Tensor, 
            size: List[int],
            interpolation: InterpolationMode = InterpolationMode.BILINEAR,
            max_size: Optional[int] = None, 
            antialias: Optional[bool] = None):
    if not isinstance(interpolation, InterpolationMode):
        raise TypeError("Argument interpolation should be a InterpolationMode")

    if not isinstance(img, torch.Tensor):
        if antialias is not None and not antialias:
            warnings.warn(
                "Anti-alias option is always applied for PIL Image input. Argument antialias is ignored."
            )
        pil_interpolation = pil_modes_mapping[interpolation]
        return F_pil.resize(img, size=size, interpolation=pil_interpolation, max_size=max_size)

    return F_t.resize(img, size=size, interpolation=interpolation.value, max_size=max_size, antialias=antialias)

def Dehaze(img: Tensor, model):
    img2 = (img.type(torch.cuda.FloatTensor) - 0.5) / 0.5
    
    img_dict = {'haze':img2.unsqueeze(0), 'paths':['dumy']} # haze: 1 x C x H x W
    model.set_input(img_dict)
    model.test()

    dehazed = model.get_current_visuals()['refine_J'].squeeze(0)
    dehazed *= 255.0
    dehazed = dehazed.round().clip(0, 255).type(torch.cuda.ByteTensor)

    return dehazed

def _get_inverse_affine_matrix(
    center: List[float], angle: float, translate: List[float], scale: float, shear: List[float], inverted: bool = True
) -> List[float]:
    # Helper method to compute inverse matrix for affine transformation

    # Pillow requires inverse affine transformation matrix:
    # Affine matrix is : M = T * C * RotateScaleShear * C^-1
    #
    # where T is translation matrix: [1, 0, tx | 0, 1, ty | 0, 0, 1]
    #       C is translation matrix to keep center: [1, 0, cx | 0, 1, cy | 0, 0, 1]
    #       RotateScaleShear is rotation with scale and shear matrix
    #
    #       RotateScaleShear(a, s, (sx, sy)) =
    #       = R(a) * S(s) * SHy(sy) * SHx(sx)
    #       = [ s*cos(a - sy)/cos(sy), s*(-cos(a - sy)*tan(sx)/cos(sy) - sin(a)), 0 ]
    #         [ s*sin(a + sy)/cos(sy), s*(-sin(a - sy)*tan(sx)/cos(sy) + cos(a)), 0 ]
    #         [ 0                    , 0                                      , 1 ]
    # where R is a rotation matrix, S is a scaling matrix, and SHx and SHy are the shears:
    # SHx(s) = [1, -tan(s)] and SHy(s) = [1      , 0]
    #          [0, 1      ]              [-tan(s), 1]
    #
    # Thus, the inverse is M^-1 = C * RotateScaleShear^-1 * C^-1 * T^-1

    rot = math.radians(angle)
    sx = math.radians(shear[0])
    sy = math.radians(shear[1])

    cx, cy = center
    tx, ty = translate

    # RSS without scaling
    a = math.cos(rot - sy) / math.cos(sy)
    b = -math.cos(rot - sy) * math.tan(sx) / math.cos(sy) - math.sin(rot)
    c = math.sin(rot - sy) / math.cos(sy)
    d = -math.sin(rot - sy) * math.tan(sx) / math.cos(sy) + math.cos(rot)

    if inverted:
        # Inverted rotation matrix with scale and shear
        # det([[a, b], [c, d]]) == 1, since det(rotation) = 1 and det(shear) = 1
        matrix = [d, -b, 0.0, -c, a, 0.0]
        matrix = [x / scale for x in matrix]
        # Apply inverse of translation and of center translation: RSS^-1 * C^-1 * T^-1
        matrix[2] += matrix[0] * (-cx - tx) + matrix[1] * (-cy - ty)
        matrix[5] += matrix[3] * (-cx - tx) + matrix[4] * (-cy - ty)
        # Apply center translation: C * RSS^-1 * C^-1 * T^-1
        matrix[2] += cx
        matrix[5] += cy
    else:
        matrix = [a, b, 0.0, c, d, 0.0]
        matrix = [x * scale for x in matrix]
        # Apply inverse of center translation: RSS * C^-1
        matrix[2] += matrix[0] * (-cx) + matrix[1] * (-cy)
        matrix[5] += matrix[3] * (-cx) + matrix[4] * (-cy)
        # Apply translation and center : T * C * RSS * C^-1
        matrix[2] += cx + tx
        matrix[5] += cy + ty

    return matrix

def Rotate(img: Tensor, angle: float, interpolation: InterpolationMode = InterpolationMode.NEAREST):
    if not isinstance(img, torch.Tensor):
        return F_pil.rotate(img, angle=angle)
    
    center_f = [0.0, 0.0]
    matrix = _get_inverse_affine_matrix(center_f, -angle, [0.0, 0.0], 1.0, [0.0, 0.0])

    return F_t.rotate(img,  matrix=matrix, interpolation=interpolation.value, expand=True, fill=[0.0, 0.0, 0.0])

def ApplyRotationToLabel(angle, obj_x, obj_y, obj_w, obj_h, width, height):
    # 1. Get corners
    obj_h2 = int(obj_h / 2)
    obj_w2 = int(obj_w / 2)

    x1 = obj_x - obj_w2
    y1 = obj_y + obj_h2

    x2 = obj_x + obj_w2
    y2 = obj_y + obj_h2

    x3 = obj_x + obj_w2
    y3 = obj_x - obj_h2

    x4 = obj_x - obj_w2
    y4 = obj_y - obj_h2

    corners = np.hstack((x1, y1, x2, y2, x3, y3, x4, y4))

    # 2. Rotate bounding box
    cx = int(width / 2)
    cy = int(height / 2)

    corners = corners.reshape(-1, 2)
    corners = np.hstack((corners, np.ones((corners.shape[0],1), dtype = type(corners[0][0]))))

    M = cv2.getRotationMatrix2D((cx, cy), angle, 1.0)

    cos = np.abs(M[0, 0])
    sin = np.abs(M[0, 1])

    nW = int((height * sin) + (width * cos))
    nH = int((height * cos) + (width * sin))

    M[0, 2] += (nW / 2) - cx
    M[1, 2] += (nH / 2) - cy

    calculated = np.dot(M,corners.T).T
    calculated = calculated.reshape(-1,8)

    # 3. Get enclosing box
    x_ = calculated[:, [0, 2, 4, 6]]
    y_ = calculated[:, [1, 3, 5, 7]]

    xmin = np.min(x_,1).reshape(-1,1)
    ymin = np.min(y_,1).reshape(-1,1)
    xmax = np.max(x_,1).reshape(-1,1)
    ymax = np.max(y_,1).reshape(-1,1)

    obj_x = int((xmin + xmax) / 2) 
    obj_y = int((ymin + ymax) / 2)
    obj_w = int(xmax - xmin)
    obj_h = int(ymax - ymin)
    
    return obj_x, obj_y, obj_w, obj_h
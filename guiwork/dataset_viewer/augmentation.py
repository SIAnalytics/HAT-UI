import cv2
import torch
import numpy as np

from torchvision.transforms.functional import F_pil
from torchvision.transforms.functional import F_t
import torchvision.transforms as transforms
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

def Resize(img: Tensor, 
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
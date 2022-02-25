import os
import re
import json
import argparse
import cv2
import shutil
import torch
import pandas as pd
import numpy as np
import multiprocessing

from datetime import datetime
import augmentation

parser = argparse.ArgumentParser()

parser.add_argument("--video_path", required = True)
parser.add_argument("--train_rate", required = True)
parser.add_argument("--validation_rate", required = True)
parser.add_argument("--test_rate", required = True)
parser.add_argument("--shuffle", required = True)
parser.add_argument("--output_path", required = True)
parser.add_argument("--augmentation", required = True)

VIDEO_PREFIX = "Video_file_"
MAX_PROC_COUNT = 12

AUGMENTATION_FACTORS = {
    "horizontal_flipping": -1,
    "vertical_flipping": -1,
    "brightness": 1.5,
    "contrast": 1.5,
    "resize": [1000, 1000]
}

# Class for building dataset
class DatasetBuilder:
    def __init__(self, args):
        self.args = args

    def GetFilesList(self):
        path = self.args.video_path

        videos = sorted([os.path.join(path, v) for v in os.listdir(path) if os.path.splitext(v)[1].lower() == ".mpg"])
        labels = sorted([os.path.join(path, v) for v in os.listdir(path) if os.path.splitext(v)[1].lower() == ".csv"])

        pairs = {}
        for i in range(len(videos)):
            fn = os.path.splitext(os.path.basename(videos[i]))[0]

            items = []
            for j in range(len(labels)):
                label_fn = os.path.splitext(os.path.basename(labels[j]))[0]
                if fn == label_fn:
                    pairs[videos[i]] = labels[j]
        
        return pairs

    def CreateTargetDirectories(self):
        # train
        dir_name = os.path.join(self.args.output_path, "train")
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
        os.makedirs(dir_name)

        subdir_name = os.path.join(dir_name, "imgs")
        os.makedirs(subdir_name)
        subdir_name = os.path.join(dir_name, "labels")
        os.makedirs(subdir_name)

        # val
        dir_name = os.path.join(self.args.output_path, "val")
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
        os.makedirs(dir_name)

        subdir_name = os.path.join(dir_name, "imgs")
        os.makedirs(subdir_name)
        subdir_name = os.path.join(dir_name, "labels")
        os.makedirs(subdir_name)

        # test
        dir_name = os.path.join(self.args.output_path, "test")
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
        os.makedirs(dir_name)

        subdir_name = os.path.join(dir_name, "imgs")
        os.makedirs(subdir_name)
        subdir_name = os.path.join(dir_name, "labels")
        os.makedirs(subdir_name)

    def CreateVideoOutputDirectories(self, video_n):
        # train
        target_path = os.path.join(self.args.output_path, "train", "imgs", f"{VIDEO_PREFIX + str(video_n)}")
        os.makedirs(target_path)

        # validate
        target_path = os.path.join(self.args.output_path, "val", "imgs", f"{VIDEO_PREFIX + str(video_n)}")
        os.makedirs(target_path)

        # test
        target_path = os.path.join(self.args.output_path, "test", "imgs", f"{VIDEO_PREFIX + str(video_n)}")
        os.makedirs(target_path)

    def GetAugmentationParameters(self, aug_settings):
        params = {
            "horizontal_flipping": -1,
            "vertical_flipping": -1,
            "brightness": -1,
            "contrast": -1,
            "resize": -1
        }
        apply_flag = False

        if aug_settings["horizontal_flipping"] > 0:
            params["horizontal_flipping"] = int(100 / aug_settings["horizontal_flipping"])
            apply_flag = True

        if aug_settings["vertical_flipping"] > 0:
            params["vertical_flipping"] = int(100 / aug_settings["vertical_flipping"])
            apply_flag = True

        if aug_settings["brightness"] > 0:
            params["brightness"] = int(100 / aug_settings["brightness"])
            apply_flag = True
        
        if aug_settings["contrast"] > 0:
            params["contrast"] = int(100 / aug_settings["contrast"])
            apply_flag = True

        if aug_settings["resize"] > 0:
            params["resize"] = int(100 / aug_settings["resize"])
            apply_flag = True

        return params, apply_flag

    def ApplyAugmentationToFrame(self, frame, frame_no, aug_params):
        # Brightness
        tensor_rgb = None
        
        if aug_params["brightness"] > 0 and frame_no % aug_params["brightness"] == 0:
            tensor_rgb = augmentation.FrameBGRToTensorRGB(frame).to()
            tensor_rgb = augmentation.AdjustBrightness(tensor_rgb, AUGMENTATION_FACTORS["brightness"])

        if aug_params["contrast"] > 0 and frame_no % aug_params["contrast"] == 0:
            if tensor_rgb is None:
                tensor_rgb = augmentation.FrameBGRToTensorRGB(frame)
            tensor_rgb = augmentation.AdjustContrast(tensor_rgb, AUGMENTATION_FACTORS["contrast"])

        if aug_params["horizontal_flipping"] > 0 and frame_no % aug_params["horizontal_flipping"] == 0:
            if tensor_rgb is None:
                tensor_rgb = augmentation.FrameBGRToTensorRGB(frame)
            tensor_rgb = augmentation.HorizontalFlip(tensor_rgb)
        
        if aug_params["vertical_flipping"] > 0 and frame_no % aug_params["vertical_flipping"] == 0:
            print("Apply vertical flipping {} {}".format(frame_no, aug_params["vertical_flipping"]))
            if tensor_rgb is None:
                tensor_rgb = augmentation.FrameBGRToTensorRGB(frame)
            tensor_rgb = augmentation.VerticalFlip(tensor_rgb)
        
        if aug_params["resize"] > 0 and frame_no % aug_params["resize"] == 0:
            if tensor_rgb is None:
                tensor_rgb = augmentation.FrameBGRToTensorRGB(frame)
            tensor_rgb = augmentation.Resize(tensor_rgb, AUGMENTATION_FACTORS["resize"])
        
        if tensor_rgb is not None:
            frame_bgr = augmentation.TensorRGBToFrameBGR(tensor_rgb)
            return frame_bgr

        return frame         

    def ApplyAugmentationToLabel(self, frame_no, aug_params, obj_x, obj_y, obj_w, obj_h, width, height):
        if aug_params["horizontal_flipping"] > 0 and frame_no % aug_params["horizontal_flipping"] == 0:
            obj_x = width - obj_x
        
        if aug_params["vertical_flipping"] > 0 and frame_no % aug_params["vertical_flipping"] == 0:
            obj_y = height - obj_y

        if aug_params["resize"] > 0 and frame_no % aug_params["resize"] == 0:
            x_factor = AUGMENTATION_FACTORS["resize"][1] / obj_w
            y_factor = AUGMENTATION_FACTORS["resize"][0] / obj_h
            obj_x = obj_x * x_factor
            obj_y = obj_y * y_factor
            obj_w = obj_w * x_factor
            obj_h = obj_h * y_factor            

        return obj_x, obj_y, obj_w, obj_h

    def ProcessFilesSet(self, id, files_list, my_first_video_n):
        print("Start working {}:{} my_files: {}".format(id, my_first_video_n, files_list))

        # Count number of frames to get augmentation
        aug_settings = json.loads(self.args.augmentation)
        aug_params, aug_apply_flag = self.GetAugmentationParameters(aug_settings)

        for num, video_file in enumerate(files_list.keys()):

            video_n = num + my_first_video_n

            labels_file = files_list[video_file]
            
            # Read labels from file
            labels = pd.read_csv(labels_file)

            # Read video file and get number of frames
            video = cv2.VideoCapture(video_file)
            frames_no = video.get(cv2.CAP_PROP_FRAME_COUNT)
            width = video.get(cv2.CAP_PROP_FRAME_WIDTH)
            height = video.get(cv2.CAP_PROP_FRAME_HEIGHT)
            frames = np.arange(frames_no, dtype=int)
            
            shuffle = json.loads(self.args.shuffle.lower())
            if shuffle == True:
                np.random.shuffle(frames)

            # Count number of frames for train/validation/test
            train_count = int((frames_no / 100) * int(self.args.train_rate))
            validation_count = int((frames_no / 100) * int(self.args.validation_rate))
            test_count = int((frames_no / 100) * int(self.args.test_rate))

            frame_no = 0

            # Create output directories
            self.CreateVideoOutputDirectories(video_n)

            # Open label files for train/val/test
            train_label_path = os.path.join(self.args.output_path, "train", "labels", f"Video_file_{video_n}.TXT")
            val_label_path = os.path.join(self.args.output_path, "val", "labels", f"Video_file_{video_n}.TXT")
            test_label_path = os.path.join(self.args.output_path, "test", "labels", f"Video_file_{video_n}.TXT")

            train_label_file = open(train_label_path, "w")
            val_label_file = open(val_label_path, "w")
            test_label_file = open(test_label_path, "w")

            label_file = None
            while video.isOpened():
                ret, frame = video.read()
                if not ret:
                    break

                # Check where the frame should be written
                dst_frame_no = frames[frame_no]
                if dst_frame_no < train_count:
                    # write to training dirs
                    label_file = train_label_file
                    frame_out_path = os.path.join(self.args.output_path, "train", "imgs", f"{VIDEO_PREFIX + str(video_n)}", "{0:07d}.PNG".format(frame_no))
                elif dst_frame_no >= train_count and dst_frame_no < (train_count + validation_count):
                    # write to validation dirs
                    label_file = val_label_file
                    frame_out_path = os.path.join(self.args.output_path, "val", "imgs", f"{VIDEO_PREFIX + str(video_n)}", "{0:07d}.PNG".format(frame_no))
                else:
                    # write to test dirs
                    label_file = test_label_file
                    frame_out_path = os.path.join(self.args.output_path, "test", "imgs", f"{VIDEO_PREFIX + str(video_n)}", "{0:07d}.PNG".format(frame_no))

                # Write labels information
                label_data = labels[labels['Frame'] == frame_no]

                # Apply augmentation to frame
                if aug_apply_flag == True:
                    frame = self.ApplyAugmentationToFrame(frame, frame_no, aug_params)

                for i in label_data.axes[0]:
                    obj_id = label_data['ID'][i]
                    obj_outer = re.findall('\(([^)]+)', label_data['객체이미지바운더리영역'][i])
                    obj_x = int(round(float(obj_outer[0].split('/')[0])))
                    obj_y = int(round(float(obj_outer[0].split('/')[1])))
                    obj_w = int(round(float(obj_outer[1].split('/')[0]))) - obj_x
                    obj_h = int(round(float(obj_outer[1].split('/')[1]))) - obj_y

                    if aug_apply_flag == True:
                        obj_x, obj_y, obj_w, obj_h = self.ApplyAugmentationToLabel(frame_no, aug_params, obj_x, obj_y, obj_w, obj_h, width, height)

                    label_file.write(f"{frame_no}, {obj_id}, {obj_x}, {obj_y}, {obj_w}, {obj_h}, 1, 1, 1, 1\n")

                cv2.imwrite(frame_out_path, frame)              
                
                cv2.waitKey()

                frame_no += 1
            
            # Close label file
            train_label_file.close()
            val_label_file.close()
            test_label_file.close()

            # Close video
            video.release()
        print("Process {} finished work".format(id))

    def BuildDataset(self):
        files_list = self.GetFilesList()
        self.CreateTargetDirectories()

        # Process files using multiple processes
        available_cpu = multiprocessing.cpu_count()
        proc_count = min(min(available_cpu, len(files_list)), MAX_PROC_COUNT)
        files_per_proc = int(len(files_list) / proc_count)

        processes = []
        for i in range(proc_count):
            if i < proc_count - 1:
                proc_files_list = dict(list(files_list.items())[i : i + files_per_proc])
            else:
                proc_files_list = dict(list(files_list.items())[i : ])

            i = i + files_per_proc

            p = multiprocessing.Process(target = self.ProcessFilesSet, args = (i, proc_files_list, i * files_per_proc))
            p.start()
            processes.append(p)

        for p in processes:
            p.join()

def main(args):
    builder = DatasetBuilder(args)

    start_time = datetime.now()
    builder.BuildDataset()
    end_time = datetime.now()
    print("PROCESSED IN {}".format(end_time - start_time))

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)


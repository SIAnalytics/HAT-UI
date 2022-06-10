import os
import re
import json
import argparse
import cv2
import shutil
import torch
import math
import random
import pandas as pd
import numpy as np
import multiprocessing
import torchvision

from datetime import datetime
from torch.multiprocessing import Pool, Process, set_start_method
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

    def CreateVideoOutputDirectories(self, part, video_name):
        target_path = os.path.join(self.args.output_path, part, "imgs", video_name)
        os.makedirs(target_path)

    def GetAugmentationParameters(self, aug_settings):
        params = {
            "horizontal_flipping": -1,
            "vertical_flipping": -1,
            "brightness": -1,
            "contrast": -1,
            "scale": -1,
            "rotate": -1,
            "contrast_factor": float(aug_settings["contrast_factor"]),
            "brightness_factor": float(aug_settings["brightness_factor"]),
            "scale_factor": float(aug_settings["scale_factor"]),
            "rotate_factor": float(aug_settings["rotate_factor"]),
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

        if aug_settings["scale"] > 0:
            params["scale"] = int(100 / aug_settings["scale"])
            apply_flag = True

        if aug_settings["rotate"] > 0:
            params["rotate"] = int(100 / aug_settings["rotate"])
            apply_flag = True

        return params, apply_flag

    def ApplyAugmentationToFrame(self, frame, frame_no, aug_params):
        if aug_params["brightness"] > 0 and frame_no % aug_params["brightness"] == 0:
            frame = augmentation.AdjustBrightness(frame, aug_params["brightness_factor"])

        if aug_params["contrast"] > 0 and frame_no % aug_params["contrast"] == 0:
            frame = augmentation.AdjustContrast(frame, aug_params["contrast_factor"])

        if aug_params["horizontal_flipping"] > 0 and frame_no % aug_params["horizontal_flipping"] == 0:
            frame = augmentation.HorizontalFlip(frame)
        
        if aug_params["vertical_flipping"] > 0 and frame_no % aug_params["vertical_flipping"] == 0:
            frame = augmentation.VerticalFlip(frame)
        
        if aug_params["scale"] > 0 and frame_no % aug_params["scale"] == 0:
            new_size = [int(aug_params["scale_factor"] * frame.size(dim = 1)), int(aug_params["scale_factor"] * frame.size(dim = 2))]
            frame = augmentation.Scale(frame, new_size)

        if aug_params["rotate"] > 0 and frame_no % aug_params["rotate"] == 0:
            frame = augmentation.Rotate(frame, aug_params["rotate_factor"])

        frame_bgr = augmentation.TensorRGBToFrameBGR(frame.cpu())
        return frame_bgr

    def ApplyAugmentationToLabel(self, frame_no, aug_params, obj_x, obj_y, obj_w, obj_h, width, height):
        if aug_params["horizontal_flipping"] > 0 and frame_no % aug_params["horizontal_flipping"] == 0:
            obj_x = width - obj_x
        
        if aug_params["vertical_flipping"] > 0 and frame_no % aug_params["vertical_flipping"] == 0:
            obj_y = height - obj_y

        if aug_params["scale"] > 0 and frame_no % aug_params["scale"] == 0:
            obj_x = obj_x * aug_params["scale_factor"]
            obj_y = obj_y * aug_params["scale_factor"]
            obj_w = obj_w * aug_params["scale_factor"]
            obj_h = obj_h * aug_params["scale_factor"]            

        return obj_x, obj_y, obj_w, obj_h

    def FlushFramesToDisk(self, gpu_video, start_idx, part, video_name, aug_apply_flag, aug_params):
        print("Process start working from [{}] SHAPE = {}".format(start_idx, gpu_video.shape))

        for i in range(50): #gpu_video.shape[0]):
          
            frame = gpu_video[i].permute(2, 0, 1)

            # Check where the frame should be written
            frame_out_path = os.path.join(self.args.output_path, part, "imgs", video_name, "{0:08d}.png".format(i + start_idx))

            # Apply augmentation to frame
            if aug_apply_flag == True:
                frame = self.ApplyAugmentationToFrame(frame, i + start_idx, aug_params)
            else:
                frame = augmentation.TensorRGBToFrameBGR(frame.cpu())

            cv2.imwrite(frame_out_path, frame)   

    def ConvertClassIDToMOT(self, class_id):
        if class_id == 10:
            return 1
        elif class_id == 20:
            return 2
        elif class_id == 30:
            return 3
        elif class_id == 40:
            return 4
        elif class_id == 50:
            return 5
        else:
            return 0

    def ProcessFilesSet(self, part, files_list, my_device):
        print("Start working with files: {}".format(files_list))

        # Count number of frames to get augmentation
        aug_settings = json.loads(self.args.augmentation)

        aug_params, aug_apply_flag = self.GetAugmentationParameters(aug_settings)

        for num, video_file in enumerate(files_list.keys()):
            video_name = os.path.splitext(os.path.basename(video_file))[0]
            print(video_name)

            # Create output directories
            self.CreateVideoOutputDirectories(part, video_name)

            labels_file = files_list[video_file]
            
            # Read labels from file
            labels = pd.read_csv(labels_file)

            # Read video file and get number of frames
            video = cv2.VideoCapture(video_file)
            frames_no = video.get(cv2.CAP_PROP_FRAME_COUNT)
            width = video.get(cv2.CAP_PROP_FRAME_WIDTH)
            height = video.get(cv2.CAP_PROP_FRAME_HEIGHT)

            # Open label files for train/val/test
            label_path = os.path.join(self.args.output_path, part, "labels", f"{video_name}.txt")

            label_file = open(label_path, "w")
            
            print("Reading video [{}] by Pytorch...".format(video_file))
            try:
                video_tensor = torchvision.io.read_video(video_file)[0]
            except Exception as e:
                print(e)
            print("Reading completed")

            print("Loading video to GPU")
            gpu_video = video_tensor.to(device = my_device)

            print("Writing files to disk {}".format(video_name))

            proc_count = 4
            frames_per_proc = int(gpu_video.shape[0] / proc_count)

            processes = []
            for i in range(proc_count):
                if i < proc_count - 1:
                    proc_frames_list = gpu_video[i * frames_per_proc : i * frames_per_proc + frames_per_proc, :, :, :]
                else:
                    proc_frames_list = gpu_video[i * frames_per_proc : , :, :, :]

                p = Process(target = self.FlushFramesToDisk, args = (proc_frames_list, i * frames_per_proc, part, video_name, aug_apply_flag, aug_params))

                p.start()
                processes.append(p)

            for p in processes:
                p.join()

            print("Process label file...")

            for i in range(gpu_video.shape[0]):
                # Write labels information
                label_data = labels[labels['Frame'] == i]

                for j in label_data.axes[0]:
                    obj_id = label_data['ID'][j]
                    obj_outer = re.findall('\(([^)]+)', label_data['객체이미지바운더리영역'][j])
                    class_id = self.ConvertClassIDToMOT(label_data['분류정보'][j])
                    obj_x = int(round(float(obj_outer[0].split('/')[0])))
                    obj_y = int(round(float(obj_outer[0].split('/')[1])))
                    obj_w = int(round(float(obj_outer[1].split('/')[0]))) - obj_x
                    obj_h = int(round(float(obj_outer[1].split('/')[1]))) - obj_y

                    if aug_apply_flag == True:
                        obj_x, obj_y, obj_w, obj_h = self.ApplyAugmentationToLabel(i, aug_params, obj_x, obj_y, obj_w, obj_h, width, height)

                    label_file.write(f"{i}, {obj_id}, {obj_x}, {obj_y}, {obj_w}, {obj_h}, 1, {class_id}, 1, 1\n")
            
            # Close label file
            label_file.close()

            # Close video
            video.release()

            print("Video {} prcessed".format(video_name))

    def BuildDataset(self):
        files_list = self.GetFilesList()

        # Shuffle orginal files if required
        shuffle = json.loads(self.args.shuffle.lower())
        if shuffle == True:
            keys = list(files_list.keys())
            random.shuffle(keys)
            shuffled_list = dict()
            for key in keys:
                shuffled_list.update({key: files_list[key]})
            files_list = shuffled_list

        # Split files by rate
        files_count = len(files_list)

        train_count = int(self.args.train_rate)
        val_count = int(self.args.validation_rate)
        test_count = int(self.args.test_rate)


        print("Creating target directories...")
        self.CreateTargetDirectories()

        # Get device for augmentation processing
        gpu_count = torch.cuda.device_count()
        if gpu_count > 0:
            my_device = 'cuda:0'
            try:
                set_start_method('spawn')
            except RuntimeError:
                print("[ERROR] Cannot set start method for torch")
                return 
        else:
            print("[ERROR] No GPU available")
            my_device = 'cpu'

        # Process train set
        self.ProcessFilesSet("train", dict(list(files_list.items())[ : train_count]), my_device)
        '''
        # Process validation set
        self.ProcessFilesSet("val", dict(list(files_list.items())[train_count : train_count + val_count]), my_device)
        # Process test set
        self.ProcessFilesSet("test", dict(list(files_list.items())[train_count + val_count : ]), my_device)
        '''

def main(args):
    builder = DatasetBuilder(args)

    start_time = datetime.now()
    builder.BuildDataset()
    end_time = datetime.now()
    print("PROCESSED IN {}".format(end_time - start_time))

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)


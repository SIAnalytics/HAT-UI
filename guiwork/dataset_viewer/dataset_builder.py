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
MAX_PROC_COUNT = 12

AUGMENTATION_FACTORS = {
    "horizontal_flipping": -1,
    "vertical_flipping": -1,
    "brightness": -1,
    "contrast": -1,
    "resize": [-1, -1]
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

        AUGMENTATION_FACTORS["brightness"] = aug_settings["brightness_factor"]
        AUGMENTATION_FACTORS["contrast"] = aug_settings["contrast_factor"]
        AUGMENTATION_FACTORS["resize"] = aug_settings["resize_factor"]


        return params, apply_flag

    def ApplyAugmentationToFrame(self, frame, frame_no, aug_params):
        if aug_params["brightness"] > 0 and frame_no % aug_params["brightness"] == 0:
            frame = augmentation.AdjustBrightness(frame, AUGMENTATION_FACTORS["brightness"])

        if aug_params["contrast"] > 0 and frame_no % aug_params["contrast"] == 0:
            frame = augmentation.AdjustContrast(frame, AUGMENTATION_FACTORS["contrast"])

        if aug_params["horizontal_flipping"] > 0 and frame_no % aug_params["horizontal_flipping"] == 0:
            frame = augmentation.HorizontalFlip(frame)
        
        if aug_params["vertical_flipping"] > 0 and frame_no % aug_params["vertical_flipping"] == 0:
            frame = augmentation.VerticalFlip(frame)
        
        if aug_params["resize"] > 0 and frame_no % aug_params["resize"] == 0:
            new_size = [AUGMENTATION_FACTORS["resize"] * frame.size(dim = 1), AUGMENTATION_FACTORS["resize"] * frame.size(dim = 2)]
            frame = augmentation.Resize(frame, new_size)
        
        frame_bgr = augmentation.TensorRGBToFrameBGR(frame.cpu())
        return frame_bgr

    def ApplyAugmentationToLabel(self, frame_no, aug_params, obj_x, obj_y, obj_w, obj_h, width, height):
        if aug_params["horizontal_flipping"] > 0 and frame_no % aug_params["horizontal_flipping"] == 0:
            obj_x = width - obj_x
        
        if aug_params["vertical_flipping"] > 0 and frame_no % aug_params["vertical_flipping"] == 0:
            obj_y = height - obj_y

        if aug_params["resize"] > 0 and frame_no % aug_params["resize"] == 0:
            obj_x = obj_x * AUGMENTATION_FACTORS["resize"]
            obj_y = obj_y * AUGMENTATION_FACTORS["resize"]
            obj_w = obj_w * AUGMENTATION_FACTORS["resize"]
            obj_h = obj_h * AUGMENTATION_FACTORS["resize"]            

        return obj_x, obj_y, obj_w, obj_h

    def ProcessFilesSet(self, id, files_list, my_first_video_n):
        print("Start working {}:{} my_files: {}".format(id, my_first_video_n, files_list))

        # Count number of frames to get augmentation
        aug_settings = json.loads(self.args.augmentation)
        aug_params, aug_apply_flag = self.GetAugmentationParameters(aug_settings)

        # Get devide for augmentation processing
        gpu_count = torch.cuda.device_count()
        if gpu_count > 0:
            my_device = 'cuda:{}'.format(id % gpu_count)
        else:
            my_device = 'cpu'

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
            print("[{}] Reading video [{}] by Pytorch...".format(id, video_file))
            try:
                video_tensor = torchvision.io.read_video(video_file)[0]
            except Exception as e:
                print(e)
            print("[{}] Reading completed".format(id))

            print("[{}] Loading video to GPU".format(id))
            gpu_video = video_tensor.to(device = my_device)

            for i in range(gpu_video.shape[0]):
          
                frame = gpu_video[i].permute(2, 0, 1)

                # Check where the frame should be written
                dst_frame_no = frames[i]
                if dst_frame_no < train_count:
                    # write to training dirs
                    label_file = train_label_file
                    frame_out_path = os.path.join(self.args.output_path, "train", "imgs", f"{VIDEO_PREFIX + str(video_n)}", "{0:07d}.PNG".format(i))
                elif dst_frame_no >= train_count and dst_frame_no < (train_count + validation_count):
                    # write to validation dirs
                    label_file = val_label_file
                    frame_out_path = os.path.join(self.args.output_path, "val", "imgs", f"{VIDEO_PREFIX + str(video_n)}", "{0:07d}.PNG".format(i))
                else:
                    # write to test dirs
                    label_file = test_label_file
                    frame_out_path = os.path.join(self.args.output_path, "test", "imgs", f"{VIDEO_PREFIX + str(video_n)}", "{0:07d}.PNG".format(i))

                # Write labels information
                label_data = labels[labels['Frame'] == i]

                # Apply augmentation to frame
                if aug_apply_flag == True:
                    frame = self.ApplyAugmentationToFrame(frame, i, aug_params)

                for j in label_data.axes[0]:
                    obj_id = label_data['ID'][j]
                    obj_outer = re.findall('\(([^)]+)', label_data['객체이미지바운더리영역'][j])
                    class_id = label_data['분류정보'][j]
                    obj_x = int(round(float(obj_outer[0].split('/')[0])))
                    obj_y = int(round(float(obj_outer[0].split('/')[1])))
                    obj_w = int(round(float(obj_outer[1].split('/')[0]))) - obj_x
                    obj_h = int(round(float(obj_outer[1].split('/')[1]))) - obj_y

                    if aug_apply_flag == True:
                        obj_x, obj_y, obj_w, obj_h = self.ApplyAugmentationToLabel(i, aug_params, obj_x, obj_y, obj_w, obj_h, width, height)

                    label_file.write(f"{i}, {obj_id}, {obj_x}, {obj_y}, {obj_w}, {obj_h}, 1, {class_id}, 1, 1\n")

                cv2.imwrite(frame_out_path, frame)              
                
                cv2.waitKey()
            
            # Close label file
            train_label_file.close()
            val_label_file.close()
            test_label_file.close()

            # Close video
            video.release()
        print("Process {} finished work".format(id))

    def BuildDataset(self):
        files_list = self.GetFilesList()
        print("Creating target directories...")
        self.CreateTargetDirectories()

        # Process files using multiple processes
        available_cpu = multiprocessing.cpu_count()
        proc_count = min(min(available_cpu, len(files_list)), MAX_PROC_COUNT)
        # Get devide for augmentation processing
        gpu_count = torch.cuda.device_count()
        proc_count = min(proc_count, gpu_count)

        files_per_proc = int(len(files_list) / proc_count)

        print("Process count: {}".format(proc_count))

        # Set start method for torch multiprocessing
        try:
            set_start_method('spawn')
        except RuntimeError:
            print("[ERROR] Cannot set start method for torch")
            return

        processes = []
        for i in range(proc_count):
            if i < proc_count - 1:
                proc_files_list = dict(list(files_list.items())[i : i + files_per_proc])
            else:
                proc_files_list = dict(list(files_list.items())[i : ])

            i = i + files_per_proc

            p = Process(target = self.ProcessFilesSet, args = (i, proc_files_list, i * files_per_proc))
            p.start()
            processes.append(p)

        for p in processes:
            pid = p.pid
            p.join()
            print("JOINED {}".format(pid))

def main(args):
    builder = DatasetBuilder(args)

    start_time = datetime.now()
    # ------------------------------------------------------
    import time
    time.sleep(10)
    # ------------------------------------------------------
    #builder.BuildDataset()
    end_time = datetime.now()
    print("PROCESSED IN {}".format(end_time - start_time))

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)


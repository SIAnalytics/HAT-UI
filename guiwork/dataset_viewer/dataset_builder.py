import os
import re
import json
import argparse
import cv2
import shutil
import time
import pandas as pd
import numpy as np

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

    def BuildDataset(self):
        files_list = self.GetFilesList()
        self.CreateTargetDirectories()

        for video_n, video_file in enumerate(files_list.keys()):
            labels_file = files_list[video_file]
            
            # Read labels from file
            labels = pd.read_csv(labels_file)

            # Read video file and get number of frames
            video = cv2.VideoCapture(video_file)
            frames_no = video.get(cv2.CAP_PROP_FRAME_COUNT)
            frames = np.arange(frames_no, dtype=int)
            
            shuffle = json.loads(self.args.shuffle.lower())
            if shuffle == True:
                np.random.shuffle(frames)

            # Count number of frames for train/validation/test
            train_count = int((frames_no / 100) * int(self.args.train_rate))
            validation_count = int((frames_no / 100) * int(self.args.validation_rate))
            test_count = int((frames_no / 100) * int(self.args.test_rate))

            self.CreateVideoOutputDirectories(video_n)

            frame_no = 0

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

                for i in label_data.axes[0]:
                    obj_id = label_data['ID'][i]
                    obj_outer = re.findall('\(([^)]+)', label_data['객체이미지바운더리영역'][i])
                    obj_x = int(round(float(obj_outer[0].split('/')[0])))
                    obj_y = int(round(float(obj_outer[0].split('/')[1])))
                    obj_w = int(round(float(obj_outer[1].split('/')[0]))) - obj_x
                    obj_h = int(round(float(obj_outer[1].split('/')[1]))) - obj_y

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

            # Remove to process all files in the set
            break

def main(args):
    builder = DatasetBuilder(args)

    start = time.process_time()
    builder.BuildDataset()
    print("PROCESSED IN {}".format(time.process_time() - start))

if __name__ == "__main__":
    args = parser.parse_args()
    main(args)


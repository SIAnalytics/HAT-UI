import os
import sys
import json
import cv2
import csv
import subprocess

from django.conf import settings

class DatasetViewerUtils:
    @staticmethod
    def GetVideosFromPath(path):
        res = {}
        res["video_info"] = []
        res["frame_info"] = {}
        class_ids = {}
        objects_count = 0
        object_ids = []

        # Define which type of dataset it is

        files_list = sorted([f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))])
        directories_list = sorted([f for f in os.listdir(path) if not os.path.isfile(os.path.join(path, f))])
        dataset_type = "TOI"

        # if there is 'train' directory, means type is MOT
        for directory in directories_list:
            if directory == "train":
                dataset_type = "MOT"
                break

        res["dataset_type"] = dataset_type
        
        if dataset_type == "TOI":
        # Process frames for each video
            for f in files_list:
                fn, ext = os.path.splitext(f)

                # Process video files
                if ext.lower() == ".mpg": 
                    # Get video length

                    video = cv2.VideoCapture(os.path.join(path, f))
                    fps = video.get(cv2.CAP_PROP_FPS)      # OpenCV2 version 2 used "CV_CAP_PROP_FPS"
                    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
                    duration = frame_count/fps

                    # Get number of objects
                    csv_file = os.path.join(path, fn + ".csv")

                    with open(csv_file) as labels:
                        labels_data = csv.reader(labels) 
                        next(labels_data)
                        for row in labels_data:
                            # Count number of objects
                            id = row[7] # ID is in 7th column
                            if id not in object_ids:
                                object_ids.append(id)

                            # Count number of classes
                            class_id = row[2]
                            if class_id not in class_ids.keys():
                                class_ids[class_id] = 1
                            else:
                                class_ids[class_id] += 1

                    video_info = {
                        '파일 이름': f,
                        '객체 수': len(object_ids),
                        '비디오 길이': int(duration)
                    }
                    res["video_info"].append(video_info)

                    video.release()
            
            res["class_info"] = class_ids
        # MOT case
        else:
            res["class_info"] = {}
            for directory in directories_list:
                class_ids = {}
                labels_path = os.path.join(path, directory, "labels")

                if os.path.exists(labels_path):
                    files_list = sorted([f for f in os.listdir(labels_path) if os.path.isfile(os.path.join(labels_path, f))])

                    for file_name in files_list:
                        csv_file = os.path.join(labels_path, file_name)
                        
                        with open(csv_file) as labels:
                            labels_data = csv.reader(labels)

                            for row in labels_data:
                                # Count number of objects
                                id = row[1]
                                if id not in class_ids:
                                    object_ids.append(id)

                                # Count number of classes
                                class_id = row[7].replace(" ", "")
                                if class_id not in class_ids.keys():
                                    class_ids[class_id] = 1
                                else:
                                    class_ids[class_id] += 1
                res["class_info"][directory] = class_ids

                                

        return res
    
    @staticmethod
    def RunDatasetSeparation(params):
        res = {
            "status": "SUCCESS"
        }

        args = [settings.ANACONDA_PYTHON_EXE, settings.SUBPROCESS_EXE["dataset_building"]]

        args.append("--video_path")
        args.append(str(params.get("video_path")))

        args.append("--train_rate")
        args.append(str(params.get("train_rate")))

        args.append("--validation_rate")
        args.append(str(params.get("validation_rate")))

        args.append("--test_rate")
        args.append(str(params.get("test_rate")))

        args.append("--shuffle")
        args.append(str(params.get("shuffle")))

        args.append("--output_path")
        args.append(str(params.get("output_path")))

        args.append("--augmentation")
        args.append(str(params.get("augmentation")))

        p = None

        try:
            with open("/nas/workspace/igor/out_dataset", "wb") as out:
            #p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                p = subprocess.Popen(args, stdout=out, stderr=out)
                print("PID = {}".format(p.pid))

            '''
            out, err = p.communicate()
            print("OUT {}".format(out))
            print("ERR {}".format(err))
            '''
        except subproccess.CalledProcessError as e:
            print("CAUGHT SUBPROCESS EXCEPTION")
            print(e.output)
            res["status"] = "FAIL"

        res["pid"] = p.pid

        return res

    @staticmethod
    def ProcessConvertDataset(path, convert_from, convert_to):
        print("{} {} {}".format(path, convert_from, convert_to))
        return "SUCCESS"

    @staticmethod
    def GetDatasetSeparationStatus(pid):
        monitoring_script = settings.SUBPROCESS_EXE["dataset_monitoring"]
        progress_args = [settings.ANACONDA_PYTHON_EXE, monitoring_script]

        progress_args.append("--pid")
        progress_args.append(str(pid))

        p = subprocess.Popen(progress_args, stdout = subprocess.PIPE)
        out, err = p.communicate()

        print("OUT = {}".format(out))
        ret = json.loads(out)

        return ret

        
import os
import re
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
        res["stat_info"] = {}

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

                            # Count average width and height
                            obj_outer = re.findall('\(([^)]+)', row[4])
                            obj_x = int(round(float(obj_outer[0].split('/')[0])))
                            obj_y = int(round(float(obj_outer[0].split('/')[1])))
                            obj_w = int(round(float(obj_outer[1].split('/')[0]))) - obj_x
                            obj_h = int(round(float(obj_outer[1].split('/')[1]))) - obj_y

                            if class_id not in res["stat_info"].keys():
                                res["stat_info"][class_id] = {
                                    "height": obj_h,
                                    "width": obj_w,
                                    "count": 1,
                                    "gsd_w": float(row[6].split("/")[0]),
                                    "gsd_h": float(row[6].split("/")[1])
                                }
                            else:
                                res["stat_info"][class_id]["height"] += obj_h
                                res["stat_info"][class_id]["width"] += obj_w
                                res["stat_info"][class_id]["count"] += 1


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
            res["stat_info"] = {}
            for directory in directories_list:
                class_ids = {}
                res["stat_info"][directory] = {}
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

                                # Count average width and height
                                obj_w = float(row[4])
                                obj_h = float(row[5])

                                if class_id not in res["stat_info"][directory].keys():
                                    res["stat_info"][directory][class_id] = {
                                        "height": obj_h,
                                        "width": obj_w,
                                        "count": 1,
                                    }
                                else:
                                    res["stat_info"][directory][class_id]["height"] += obj_h
                                    res["stat_info"][directory][class_id]["width"] += obj_w
                                    res["stat_info"][directory][class_id]["count"] += 1
                                    
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
            with open("/project/out_dataset", "wb") as out:
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
        processing_exe = None

        res = {
            "status": "SUCCESS"
        }

        print("CONVERTING DATASET")

        if convert_from == "MOT":
            if convert_to == "FairMOT":
                processing_exe = settings.CONVERSION_TOOLS["MOT_TO_FairMOT"]
            elif convert_to == "YOLOX COCO":
                processing_exe = settings.CONVERSION_TOOLS["MOT_TO_YOLOX_COCO"]
            elif convert_to == "EfficientDet COCO":
                processing_exe = settings.CONVERSION_TOOLS["MOT_TO_EfficientDET_COCO"]
            else:
                res["status"] = "FAIL. Unsupported conversion types"
            
            args = [settings.ANACONDA_PYTHON_EXE, processing_exe]

            args.append("--data_root")
            args.append(path)

            if convert_to == "YOLOX COCO" or convert_to == "EfficientDet COCO":
                args.append("--num_classes")
                args.append(str(settings.DEFAULT_NUM_CLASSES))

            print(args)
            p = None
            try:
                p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            except subprocess.CalledProcessError as e:
                print("CAUGHT EXCEPTION")
                print(e.output)
                res["status"] = "FAIL"

            res["pid"] = p.pid

        return res

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

    @staticmethod
    def GetDatasetConversionStatus(pid):
        monitoring_script = settings.SUBPROCESS_EXE["dataset_monitoring"]
        progress_args = [settings.ANACONDA_PYTHON_EXE, monitoring_script]

        progress_args.append("--pid")
        progress_args.append(str(pid))

        p = subprocess.Popen(progress_args, stdout = subprocess.PIPE)
        out, err = p.communicate()

        print("OUT = {}".format(out))
        ret = json.loads(out)

        return ret
        
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
        res = []

        files_list = sorted([f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))])
        
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
                objects_count = 0
                object_ids = []
                csv_file = os.path.join(path, fn + ".csv")
                with open(csv_file) as labels:
                    labels_data = csv.reader(labels)
                    for row in labels_data:
                        id = row[7] # ID is in 7th column
                        if id not in object_ids:
                            object_ids.append(id)

                video_info = {
                    '파일 이름': f,
                    '객체 수': len(object_ids),
                    '비디오 길이': int(duration)
                }
                res.append(video_info)

                video.release()

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

        return res

        
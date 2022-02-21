import os
import sys
import json
import cv2
import csv

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
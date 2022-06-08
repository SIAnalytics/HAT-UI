import os
import json

from django.conf import settings

class CommonUtils:
    @staticmethod
    def GetRootContent():
        files_list = [x for x in os.listdir(settings.ROOT_STORAGE_PATH)]
        files_list = sorted(files_list, key=str.casefold)

        parent_id = 0
        current_id = 1

        ret_json = []
        ret_json.append({
            "id": 0,
            "parentId": None,
            "label": settings.ROOT_STORAGE_PATH,
            "path": settings.ROOT_STORAGE_PATH,
            "items": [

            ],
            "loaded": 1
        })

        for entry in files_list:
            full_path = os.path.join(settings.ROOT_STORAGE_PATH, entry)
            # Check if it's a directtory or file
            if os.path.isdir(os.path.join(settings.ROOT_STORAGE_PATH, entry)):
                # append new directory
                ret_json.append({
                    "id": current_id,
                    "parentId": parent_id,
                    "label": entry,
                    "path": full_path,
                    "items": [

                    ],
                    "loaded": 0
                })
                current_id += 1
            else:
                # append new file
                ret_json[0]["items"].append({
                    "id": full_path,
                    "parentId": parent_id,
                    "label": entry,
                    "path": full_path
                })

        return ret_json

    @staticmethod
    def GetDirectoryContent(path, parent_id, current_id):
        directory_content = [x for x in os.listdir(path)]
        directory_content = sorted(directory_content, key=str.casefold)
        ret_content = {
            "files": [],
            "dirs": []
        }

        for entry in directory_content:
            full_path = os.path.join(path, entry)

            if os.path.isdir(os.path.join(path, entry)):
                ret_content["dirs"].append({
                    "id": current_id,
                    "parentId": parent_id,
                    "label": entry,
                    "path": full_path,
                    "items": [

                    ],
                    "loaded": 0
                })
                current_id += 1
            else:
                ret_content["files"].append({
                    "id": full_path,
                    "parentId": parent_id,
                    "label": entry,
                    "path": full_path
                })

        return ret_content

    @staticmethod
    def CreateNewDirectory(path, new_folder):
        if path == "":
            path = settings.ROOT_STORAGE_PATH

        path_to_create = os.path.join(path, new_folder)
        if not os.path.exists(path_to_create):
            os.makedirs(path_to_create)

        ret_content = {}
        return ret_content
    
    @staticmethod
    def GetImageURL(path):
        ret_content = {"url": path.replace(settings.MEDIA_ROOT, settings.MEDIA_URL)}

        return ret_content
import os
import json
import random

from django.conf import settings

class TrainingHelperUtils:
    @staticmethod
    def GetModelsList():
        json_file_path = settings.MODELS_CONFIG_FILE_PATH

        model_list = []

        with open(json_file_path) as f:
            model_data = json.load(f)
            for key in model_data.keys():
                model_list.append({
                    "id": key,
                    "name": key
                })            

        return model_list
    
    @staticmethod
    def GetModelHyperparams(model_name):
        params = []

        json_file_path = settings.MODELS_CONFIG_FILE_PATH

        with open(json_file_path) as f:
            model_data = json.load(f)

            if model_name in model_data.keys():
                params = model_data[model_name]

        return params

    @staticmethod
    def RunModelTraining():

        return "SUCCESS"

    @staticmethod
    def GetTrainingProgress():
        progress = random.randint(0, 100)
        ret = {
            "progress": progress
        }

        return ret
        
    @staticmethod
    def SaveModelParameters(path):
        print("SAVING TO PATH {}. Require backend implementation".format(path))
        return "SUCCESS"
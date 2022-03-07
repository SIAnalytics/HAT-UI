import os
import sys
import json
import random
import subprocess
import shutil

from django.conf import settings
from django.core.files import File
from django.http import HttpResponse

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
    def RunModelTraining(params):
        model_name = params.get("model_name")
        experiment_id = "FairMOT-mot16"

        ret_info = {}

        # Default value
        epoch_count = 250

        if model_name == "FairMOT":
            # Remove tensorboard log file if exists (For progress testing ONLY)
            log_file_path = os.path.join(settings.MODELS_LOG_PATH[model_name], experiment_id)
            if os.path.exists(log_file_path):
                shutil.rmtree(log_file_path)
            #------------------------------------------------------------
            dataset_path = params.get("dataset_path")
            model_path = params.get("model_path")
            hyper_parameters = json.loads(params.get("hyper_parameters"))

            random_flag = json.loads(params.get("random_flag").lower())
            hyper_default_flag = json.loads(params.get("hyper_default_flag").lower())

            train_file_path = settings.MODELS_TRAIN_FILES["FairMOT"]
            
            args = [settings.ANACONDA_PYTHON_EXE, train_file_path]
            args.append("mot")

            args.append("--exp_id")
            args.append(experiment_id)

            if random_flag == False:
                args.append("--load_model")
                args.append(model_path)

            args.append("--data_cfg")
            args.append(settings.TRAINING_HELPER_DATA_CONFIG)

            args.append("--dataset")
            args.append(dataset_path)

            if hyper_default_flag == False:
                # Learning rate
                for parameter in hyper_parameters:
                    args.append(parameter["prop"])
                    args.append(str(parameter["value"]))

                    if parameter["prop"] == "--num_epochs":
                        epoch_count = parameter["value"]

            # Run the training process
            p = None

            try:
                p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            except subprocess.CalledProcessError as e:
                print("CAUGHT EXCEPTION")
                print(e.output)

            # Get path of logfile
            log_path = os.path.join(settings.MODELS_LOG_PATH[model_name], experiment_id, settings.LOGS_PATH_NAME)

            ret_info["log_path"] = log_path
            ret_info["experiment_id"] = experiment_id
            ret_info["pid"] = p.pid
            ret_info["epoch_count"] = epoch_count
            print(p.pid)

        else:
            return "Unsupported model name"

        return ret_info

    @staticmethod
    def GetTrainingProgress(experiment_id, pid, last_epoch, model_name, epoch_count, log_path):
        # Get progress using subprocess
        monitoring_script = settings.SUBPROCESS_EXE["training_monitoring"]
        progress_args = [settings.ANACONDA_PYTHON_EXE, monitoring_script]

        progress_args.append("--experiment_id")
        progress_args.append(str(experiment_id))
        progress_args.append("--pid")
        progress_args.append(str(pid))
        progress_args.append("--last_epoch")
        progress_args.append(str(last_epoch))
        progress_args.append("--log_path")
        progress_args.append(log_path)
        progress_args.append("--epoch_count")
        progress_args.append(str(epoch_count))

        p = subprocess.Popen(progress_args, stdout=subprocess.PIPE)
        out, err = p.communicate()

        '''
        print("OUT {}".format(out))
        print("ERR {}".format(err))
        '''

        ret = json.loads(out)

        return ret
        
    @staticmethod
    def SaveModelWeights(path):
        # Check if file exists
        print(path)
        if os.path.isdir(path):
            return "[ERROR] Cannot download directory. Choose file"

        f = open(path, 'rb')
        file_to_download = File(f)
        response = HttpResponse(file_to_download.read())
        response['Content-Disposition'] = 'attachment'
        
        return response
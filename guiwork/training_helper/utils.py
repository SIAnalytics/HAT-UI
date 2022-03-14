import os
import sys
import json
import random
import subprocess
import shutil

from datetime import datetime
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
        dataset_path = params.get("dataset_path")
        model_path = params.get("model_path")
        hyper_parameters = json.loads(params.get("hyper_parameters"))

        random_flag = json.loads(params.get("random_flag").lower())
        hyper_default_flag = json.loads(params.get("hyper_default_flag").lower())

        ret_info = {}
        log_path = ""

        curr_time_str = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")

        # Default value
        if model_name == "FairMOT":
            epoch_count = 250
            experiment_id = curr_time_str
            model_home = settings.MODELS_HOME["FairMOT"]

            # Remove tensorboard log file if exists (For progress testing ONLY)
            log_file_path = os.path.join(settings.MODELS_LOG_PATH[model_name], experiment_id)
            if os.path.exists(log_file_path):
                shutil.rmtree(log_file_path)
            #------------------------------------------------------------
            train_file_path = settings.MODELS_TRAIN_FILES["FairMOT"]
            
            args = [settings.ANACONDA_PYTHON_EXE, train_file_path]

            args.append("--exp_id")
            args.append(experiment_id)

            if random_flag == False:
                args.append("--load_model")
                args.append(model_path)

            args.append("--data_dir")
            args.append(dataset_path)

            if hyper_default_flag == False:
                # Learning rate
                for parameter in hyper_parameters:
                    args.append(parameter["prop"])
                    args.append(str(parameter["value"]))

                    if parameter["prop"] == "--num_epochs":
                        epoch_count = parameter["value"]

            print(args)
            # Get path of logfile
            log_path = os.path.join(settings.MODELS_LOG_PATH[model_name], curr_time_str)

        elif model_name == "YOLOX":
            epoch_count = 300
            experiment_id = "YOLOX"
            model_home = settings.MODELS_HOME["YOLOX"]

            train_file_path = settings.MODELS_TRAIN_FILES["YOLOX"]
            args = [settings.ANACONDA_PYTHON_EXE, train_file_path]

            if random_flag == False:
                args.append("-c")
                args.append(model_path)

            args.append("data_dir")
            args.append(dataset_path)

            if hyper_default_flag == False:
                for parameter in hyper_parameters:
                    if parameter["prop"] == "max_epoch":
                        epoch_count = parameter["value"]

                    if parameter["prop"] == "output_dir":
                        log_path = os.path.join(settings.MODELS_LOG_PATH[model_name], parameter["value"], curr_time_str)
                        args.append(parameter["prop"])
                        args.append(str(parameter["value"] + "/" + curr_time_str))
                    else:
                        args.append(parameter["prop"])
                        args.append(str(parameter["value"]))

            print(args)        
        elif model_name == "EfficientDet":
            epoch_count = 100
            experiment_id = "EfficientDet"
            model_home = settings.MODELS_HOME["EfficientDet"]

            train_file_path = settings.MODELS_TRAIN_FILES["EfficientDet"]
            args = [settings.ANACONDA_PYTHON_EXE, train_file_path]
            args.append("--config-file")
            args.append(settings.EFFICIENT_DET_CONFIG)

            for parameter in hyper_parameters:
                if parameter["prop"].find("--") == 0:
                    args.append(parameter["prop"])
                    args.append(parameter["value"])

            args.append(f"dataloader.data_dir={dataset_path}")

            if hyper_default_flag == False:
                for parameter in hyper_parameters:
                    if parameter["prop"] == "train.output_dir":
                        log_path = os.path.join(settings.MODELS_LOG_PATH[model_name], parameter["value"], curr_time_str)
                        args.append(f"{parameter['prop']}={parameter['value'] + '/' + curr_time_str}")
                    else:
                        if parameter["prop"].find("--") == 0:
                            continue
                        else:
                            args.append(f"{parameter['prop']}={parameter['value']}")

            print(args) 
        else:
            return "Unsupported model name"

        try:
            with open("/project/training_log", "wb") as out:
                #p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                p = subprocess.Popen(args, stdout=out, stderr=out, cwd=model_home)
        except subprocess.CalledProcessError as e:
            print("CAUGHT EXCEPTION")
            print(e.output)

        ret_info["log_path"] = log_path
        ret_info["experiment_id"] = experiment_id
        ret_info["pid"] = p.pid
        ret_info["epoch_count"] = epoch_count
        print(p.pid)

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
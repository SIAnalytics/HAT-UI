from rest_framework import views
from rest_framework.response import Response
import json
from .utils import TrainingHelperUtils as utils

class TrainingHelper(views.APIView):
    #GET hadler
    def get(self, request):
        
        req = request.GET.get("req")

        if req == "GET_MODELS_LIST":
            return Response(utils.GetModelsList())
        elif req == "GET_MODEL_HYPERPARAMS":
            return Response(utils.GetModelHyperparams(request.GET.get("model_name")))
        elif req == "GET_TRAINING_PROGRESS":
            return Response(utils.GetTrainingProgress())
        else:
            print("[ERROR] Unsupported request content {}".format(req))

        return Response("Unsupported request content")

    #POST
    def post(self, request):

        req = request.POST.get("req")

        if req == "RUN_MODEL_TRAINING":
            for key in request.POST.keys():
                print(f"{key}: {request.POST.get(key)}")

            return Response(utils.RunModelTraining())
        else:
            print("[ERROR] Unsupported request content {}".format(req))

        return Response("Unsupported request content")


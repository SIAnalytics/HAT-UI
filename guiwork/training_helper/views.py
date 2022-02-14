from rest_framework import views
from rest_framework import status
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

        res = {"code": 400, "message": "Unsupported request content"}
        return Response(data=json.dumps(res), status=status.HTTP_400_BAD_REQUEST)

    #POST
    def post(self, request):

        req = request.POST.get("req")

        if req == "RUN_MODEL_TRAINING":
            return Response(utils.RunModelTraining(request.POST))
        elif req == "SAVE_MODEL_PARAMETERS":
            return Response(utils.SaveModelParameters(request.POST.get("path")))
        else:
            print("[ERROR] Unsupported request content {}".format(req))

        res = {"code": 400, "message": "Unsupported request content"}
        return Response(data=json.dumps(res), status=status.HTTP_400_BAD_REQUEST)


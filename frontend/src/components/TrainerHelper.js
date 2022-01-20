import React from "react";
import { 
    TR_1,
    TR_5,
    TR_8,
    TR_9,
    TR_67,
    TR_234,
} from "./controls";

function TrainerHelper() {
    return(
        <div className="container">
            <div className="row">
                <div className="col-md-6">
                    <div className="options-content">
                        <TR_1 />
                    </div>
                </div>
                <div className="col-md-6">

                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="options-content">
                        <TR_234 />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="options-content">
                        <TR_5 />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-1"></div>
                <div className="col-md-8">
                    <div className="options-content">
                        <TR_67 />
                    </div>
                </div>
                <div className="col-md-1"></div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="options-content">
                        <TR_8 />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="options-content">  
                        <TR_9 />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TrainerHelper;
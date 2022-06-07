import React, { useState } from "react"
import {
    Container,
    Row,
} from "react-bootstrap";

import {
    DV_123456,
    DV_78910,
    DV_1112,
    DV_13,
} from "./controls";

import {
    DatasetContext,
    DatasetProvider
} from "./DatasetContext";

function DatasetViewer() {
    const DatasetState = {
        train_rate: 0,
        validation_rate: 0,
        test_rate: 0,
        shuffle: false,
        output_path: "",
        convert_path: "",
        convert_to: "",
        augmentation: {
            horizontal_flipping: 0,
            vertical_flipping: 0,
            brightness: 0,
            contrast: 0,
            scale: 0,
            brightness_factor: 0,
            contrast_factor: 0,
            scale_factor: 0
        }
    };

    const [videoCount, setVideoCount] = useState(0)
    const [videoPath, setVideoPath] = useState(0)

    return (
        <Container>
            <DatasetProvider value={{ DatasetState }}>
                <Row>
                    <div className="col-md-6">
                        <div className="options-content">
                            <DV_123456
                                setVideoCount={setVideoCount}
                                setVideoPath={setVideoPath}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="options-content">
                            <DV_78910
                                videoCount={videoCount}
                                videoPath={videoPath}
                            />
                        </div>
                        <br></br>
                        <div className="options-content">
                            <DV_1112 />
                        </div>
                    </div>
                </Row>
                <Row>
                    <div className="col-md-12">
                        <div className="options-content">
                            <DV_13 />
                        </div>
                    </div>
                </Row>
            </DatasetProvider>
        </Container>
    );
}

export default DatasetViewer;
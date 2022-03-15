import React from "react";

import {
    Form,
    Button,
    ButtonGroup,
    InputGroup,
} from "react-bootstrap";

import {
    LineChart,
} from "./charts";

var GraphCount = 6;

var GraphStyles = [
    {
        backgroundColor: "rgba(232, 19, 0, 0.3)",
        borderColor: "#e81300",
    },
    {
        backgroundColor: "rgba(32, 158, 3, 0.3)",
        borderColor: "#209e03",
    },
    {
        backgroundColor: "rgba(3, 0, 150, 0.3)",
        borderColor: "#030096",
    },
    {
        backgroundColor: "rgba(158, 0, 142, 0.3)",
        borderColor: "#9e008e",
    },
    {
        backgroundColor: "rgba(0, 140, 158, 0.3)",
        borderColor: "#008c9e",
    },
    {
        backgroundColor: "rgba(209, 126, 10, 0.3)",
        borderColor: "#d17e0a",
    },
]

class TR_8 extends React.Component{
    constructor(props) {
        super(props);

        this.graph_data = [];
        for (var i = 0; i < GraphCount; i++) {
            this.graph_data.push(
                {
                    labels: [],
                    datasets: [
                        {
                            label: "",
                            data: [],
                            fill: true,
                            backgroundColor: GraphStyles[i % GraphCount].backgroundColor,
                            borderColor: GraphStyles[i % GraphCount].borderColor,
                        }
                    ]
                }
            )
        }

        this.state = {
            graph_setting_0: this.graph_data[0],
            graph_setting_1: this.graph_data[1],
            graph_setting_2: this.graph_data[2],
            graph_setting_3: this.graph_data[3],
            graph_setting_4: this.graph_data[4],
            graph_setting_5: this.graph_data[5],
            show_graph_0: true,
            show_graph_1: true,
            show_graph_2: false,
            show_graph_3: false,
            show_graph_4: false,
            show_graph_5: false,
        };

        SetGraphData = SetGraphData.bind(this);
    }

    /*state = {
        graph_setting_1: this.graph_data[0]
    };*/

    ToggleVisibleCharts(n_1, n_2) {
        var key_map = {
            0: "show_graph_0",
            1: "show_graph_1",
            2: "show_graph_2",
            3: "show_graph_3",
            4: "show_graph_4",
            5: "show_graph_5"
        }

        var state = {

        };

        for (var i = 0; i < 6; i++) {
            if (i == n_1 || i == n_2) {
                state[key_map[i]] = true;
            } else {
                state[key_map[i]] = false;
            }
        }

        this.setState(state);
    }

    render() {
        return (
            <>
                <InputGroup>
                    <h5 className="col-md-6"><b>검증 성능 확인</b></h5>
                    <div className="col-md-3"></div>
                    <ButtonGroup className="col-md-3">
                        <Button variant="outline-secondary" onClick={() => { this.ToggleVisibleCharts(0, 1) }} className="btn-sm">1</Button>
                        <Button variant="outline-secondary" onClick={() => { this.ToggleVisibleCharts(2, 3) }} className="btn-sm">2</Button>
                        <Button variant="outline-secondary" onClick={() => { this.ToggleVisibleCharts(4, 5) }} className="btn-sm">3</Button>
                    </ButtonGroup>
                </InputGroup>

                <Form className='d-flex'> 
                    { this.state.show_graph_0 ? <LineChart  label="" graph_data={this.state.graph_setting_0} className="col-md-6" chart_type="chart-style"/> : null }                   
                    { this.state.show_graph_1 ? <LineChart  label="" graph_data={this.state.graph_setting_1} className="col-md-6" chart_type="chart-style"/> : null }

                    { this.state.show_graph_2 ? <LineChart  label="" graph_data={this.state.graph_setting_2} className="col-md-6" chart_type="chart-style"/> : null }                   
                    { this.state.show_graph_3 ? <LineChart  label="" graph_data={this.state.graph_setting_3} className="col-md-6" chart_type="chart-style"/> : null }

                    { this.state.show_graph_4 ? <LineChart  label="" graph_data={this.state.graph_setting_4} className="col-md-6" chart_type="chart-style"/> : null }                   
                    { this.state.show_graph_5 ? <LineChart  label="" graph_data={this.state.graph_setting_5} className="col-md-6" chart_type="chart-style"/> : null }                   
                </Form>
            </>
        );
    }
}

function SetGraphData(training_data) {
    // 1. Generate data for graph 1
    
    var graph_setting_0 = {
        labels: [],
        datasets: [
            {
                label: "",
                data: [],
                fill: true,
                backgroundColor: GraphStyles[0].backgroundColor,
                borderColor: GraphStyles[0].borderColor,
            }
        ]
    };
    
    //-----------------------------------------------------------
    var state = {};
    for (var i = 0; i < Object.keys(training_data).length; i++) {
        if (i > 5) {
            break;
        }

        var key = Object.keys(training_data)[i];

        var curr_settings = {
            labels: [],
            datasets: [
                {
                    label: "",
                    data: [],
                    fill: true,
                    backgroundColor: GraphStyles[i].backgroundColor,
                    borderColor: GraphStyles[i].borderColor,
                }
            ]
        };
        curr_settings.datasets[0].label = key;
        var graph_data = training_data[key];

        for (var key of Object.keys(graph_data)) {
            curr_settings.labels.push(key);
            curr_settings.datasets[0].data.push(graph_data[key]);
        }
        
        switch (i) {
            case 0: {
                state.graph_setting_0 = curr_settings;
                break;
            }
            case 1: {
                state.graph_setting_1 = curr_settings;
                break;
            }
            case 2: {
                state.graph_setting_2 = curr_settings;
                break;
            }
            case 3: {
                state.graph_setting_3 = curr_settings;
                break;
            }
            case 4: {
                state.graph_setting_4 = curr_settings;
                break;
            }
            case 5: {
                state.graph_setting_5 = curr_settings;
                break;
            }
            default: 
                break;
        }
    }

    this.setState(state);
}

export default TR_8;
export {
    SetGraphData
};
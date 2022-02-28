import React from "react";
import { 
  Bar, 
  Line,
  Pie 
} from "react-chartjs-2";

import Chart from 'chart.js/auto'
import { ThemeProvider } from "react-bootstrap";

class LineChart extends React.Component {
  constructor(props) {
    super(props);

    this.className = props["className"];
  }

  state = {
    data: this.props.graph_data
  };

  render() {
    return (
        <>
          <div className={this.className}>
            <div className="chart-style">
              <Line 
                data={this.props.graph_data} 
                options={{ maintainAspectRatio: true }}
              />
            </div>
          </div>
        </>
    );
  }
}

class BarChart extends React.Component {
  constructor(props) {
    super(props);

    this.data = {
      labels: ["1", "2", "3",
        "4", "5", "6"],
      datasets: [
        {
          label: props["label"],
          data: [0.2, 0.3, 0.4, 0.8, 0.6, 0.2, 0.3],
          fill: true,
          backgroundColor: "rgba(62, 139, 240, 0.8)",
          borderColor: "#096beb",
        }
      ]
    };

    this.className = props["className"]
  }

  render() {
    return (
      <>
        <div className={this.className}>
          <div className="chart-style">
            <Bar data={this.data} options={{ maintainAspectRatio: true }}/>
          </div>
        </div>
      </>
    );
  }
}

class PieChart extends React.Component {
  constructor(props) {
    super(props);

    this.className = props["className"];

    this.options = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
            display: true,
            position: 'right',
        }
      }
    }
  }

  render() {
    return (
      <>
        <div className={this.className}>
          <div className="chart-style">
            <Pie data={this.props.graph_data} options={this.options} />
          </div>
        </div>
      </>
    );
  }
}

export {
  LineChart,
  BarChart,
  PieChart,
};
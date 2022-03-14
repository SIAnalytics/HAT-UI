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
            <div className={this.props.chart_type}>
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

    this.className = props["className"]
  }

  render() {
    return (
      <>
        <div className={this.className}>
          <div className={this.props.chart_type}>
            <Bar data={this.props.graph_data} options={{ maintainAspectRatio: true }}/>
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
          <div className={this.props.chart_type}>
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
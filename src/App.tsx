import './App.css';
import {useState } from 'react';
import {useUpdateCall } from '@ic-reactor/react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

function App() {
  // npm ic-reactor/react
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [pair, setPair] = useState("");
  const [dataArray, setDataArray] = useState([]);
  const [received, setReceived] = useState(false);
  const [chart, setChart] = useState(false);
  const [chartData, setChartData] = useState("");


  const { call, data, loading } = useUpdateCall({
    functionName: "get_icp_usd_exchange",
    args: [start, end, pair],
    onLoading: (loading) => console.log("Loading", loading),
    onError: (error) => alert(error),
    onSuccess: (data) => handleSuccess(data)
  });

  const handleChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (name === "start") {
      setStart(Math.floor(new Date(value).getTime() / 1000))
    }
    else if (name === "end") {
      setEnd(Math.floor(new Date(value).getTime() / 1000))
    } else if (name === "pair") {
      setPair(value)
    }

  }

  const handleSuccess = async (data) => {
    setReceived(true);
    console.log('Received data:', data);
    const arrayData = await JSON.parse(data);
    setDataArray(arrayData);
  };

  const generateChart = () => {

    const timestamps = dataArray.map(item => new Date(item[0] * 1000).toLocaleDateString()); // Convert timestamps to readable dates
    const prices = dataArray.map(item => item[4]); // Get the closing prices

    const data = {
      labels: timestamps,
      datasets: [
        {
          label: 'Closing Price',
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 1,
        }
      ],
    };
    setChartData(data);
    setChart(true);
  };

  return (
    <>
      <div className="">
        <h1>Crypto Price</h1>
        <form>
          <div className="form-group">
            <label htmlFor="start">Start Date</label>
            <input className="form-control" name="start" type="datetime-local" onChange={handleChange} disabled={loading} placeholder="pick date and time" required />
          </div>
          <div className="form-group">
            <label htmlFor="end">End Date</label>
            <input className="form-control" name="end" type="datetime-local" onChange={handleChange} disabled={loading} placeholder="pick date and time" required />
          </div>
          <div className="form-group">
            <label htmlFor="pair">Pair</label>
            <input className="form-control" name="pair" onChange={handleChange} disabled={loading} placeholder="Eg. BTC-USD" required />
          </div>
          <br />
          <button type="button" className="btn btn-primary" onClick={call} disabled={loading||received}>Fetch Data</button>
          {loading && <div className="loader"></div>}
        </form>
      </div>
      <br />
      {received&&<div><button className="btn btn-info" onClick={generateChart}>Generate Chart</button>{chart && <Line data={chartData} />}</div>}
      <br/>
      {received && <div className="table-responsive">
        <h4>Raw Data</h4>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col" >Low</th>
              <th scope="col">High</th>
              <th scope="col">Open</th>
              <th scope="col">Close</th>
              <th scope="col">Volume</th>
            </tr>
          </thead>
          <tbody>
            {dataArray.map((hour) => (
              <tr key={hour[0]}>
                <td>{new Date(hour[0] * 1000).toISOString()}</td>
                <td>{hour[1]}</td>
                <td>{hour[2]}</td>
                <td>{hour[3]}</td>
                <td>{hour[4]}</td>
                <td>{hour[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </>
  );
}

export default App;

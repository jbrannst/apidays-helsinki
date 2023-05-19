import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import { useState, useEffect, useRef } from "react";

const dataApiBaseUrl = "https://data.mongodb-api.com/app/pokemon-bpmfw/endpoint/";

const sdk = new ChartsEmbedSDK({
  baseUrl: "https://charts.mongodb.com/charts-pierre-petersson-demo-pro-hvvjx", // Optional: ~REPLACE~ with the Base URL from your Embed Chart dialog
});

const chart = sdk.createChart({
  chartId: "6462a492-36b3-4564-8f6d-adc5fc53bb79", // Optional: ~REPLACE~ with the Chart ID from your Embed Chart dialog

  height: "700px"
});
const chartStyle = {
  display: "contents"

};
export default function Chart(props) {
  const [payload, setPayload] = useState({});
  const [accessToken, setAccessToken] = useState(null);
  const [show, setShow] = useState(false);
  const email = useRef(props.userEmail);
  const appId = useRef(props.appId);
  const character = useRef(props.selectedCharacter);
  let token = null;

  useEffect(() => {
    const render = async () => {
      await chart.render(document.getElementById("chart"));
      await chart.addEventListener("click", handleChartClick);
    };
    render().catch((e) => window.alert(e.message));

    const authenticate = async () => {
      const authUrl = `https://realm.mongodb.com/api/client/v2.0/app/`+appId.current.toString()+`/auth/providers/anon-user/login`
      // Authenticate with the server
      // Anonymous authentication must be enabled in app services
      const tokens = await fetch(authUrl).then(res => res.json());
      setAccessToken(tokens.access_token);
      token = tokens.access_token;
    }
    authenticate();
  }, []);

  useEffect(() => {
    appId.current = props.appId;
    email.current = props.userEmail;
    character.current = props.selectedCharacter;
  }, [props])

  const handleChartClick = async (payload) => {
    setPayload(payload);
    handleSubmit(payload, props);
  }

  async function handleSubmit(payload, props) {
    var requestOptions = {
      method: "POST",
      redirect: "follow"
    };
    
    console.log(appId);
    console.log("^^^^");
    var long = payload.data.geopoint.value.coordinates[0];
    var lat = payload.data.geopoint.value.coordinates[1];
    const response = await fetch(`https://data.mongodb-api.com/app/`+appId.current.toString()+`/endpoint/hint?long=`+long+'&lat='+lat+'&email='+email.current+'&characterId='+character.current.id, 
    // const response = await fetch(dataApiBaseUrl + '/hint?long=' + long + '&lat=' + lat + '&email=' + email.current + '&characterId=' + character.current.id,
      requestOptions
    );

    const result = await response.json();
    chart.refresh();
    console.log(result);
  }
  return (
    <>
      <div id="chart" style={chartStyle}></div>

      <div>
        <button onClick={() => setShow(!show)}>Show Payload</button>
      </div>
      {show && (
        <div id="info">
          <ul>
            <li>UserEmail: {props.userEmail}</li>
            <li>Access Token: {accessToken}</li>
            <li>Role: {payload?.target?.role}</li>
            <li>Type: {payload?.target?.type}</li>
            <li>Fill: {payload?.target?.fill}</li>
            <li>x.label: {payload?.data?.x?.label}</li>
            {/* <li>x.value: {payload?.data?.x?.value}</li> */}
            <li>y.label: {payload?.data?.y?.label}</li>
            {/* <li>y.value: {payload?.data?.y?.value}</li> */}
            <li>color.label: {payload?.data?.color?.label}</li>
            <li>color.value: {payload?.data?.color?.value}</li>
          </ul>

          <div id="payload">
            <pre>{JSON.stringify(payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </>

  )
}
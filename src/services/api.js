import Cookies from 'universal-cookie';
export const API_ENDPOINT = API_URL;

const binaryContentTypesToBeSaved = [
  'image/png', 'image/jpeg', 'image/jpg', 'application/x-tar'
];

const getBearerToken = async () => {
  try {
    const cookies = new Cookies();
    const sessionToken = cookies.get('authToken');
    if (sessionToken !== null && sessionToken !== undefined) {
      return 'Bearer ' + sessionToken;
    } else {
      return '';
    }
  } catch (error) {
    return '';
  }
};

const parseData = async (response, headers, debug = false) => {
  if (debug) {
    console.warn('Trying to parse data');
  }
  const responseBlob = response.clone();
  const contentType = await headers.get('Content-Type');
  if (contentType){
    if (contentType.includes('json')) {
      const rawData = await response.json();
      return (rawData);
    } if (binaryContentTypesToBeSaved.find((currType) => contentType.includes(currType))) {
        const blob = await responseBlob.blob();
        const data = URL.createObjectURL(blob);
        return data;
    }
  }
  return response.text();
};

const fetchMethod = async (url, initialFetchConfig, timeout = 5000, debug = false) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const fetchConfig = { ...initialFetchConfig, signal };

  const abortTimeout = setTimeout(() => {
    controller.abort();
  }, timeout);

  debug && console.warn(fetchConfig);

  let response;
  try {
    response = await fetch(url, fetchConfig);
    if (!response.ok && debug) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    const responseObject = {
      status: response.status,
      statusText: response.statusText,
      headers: JSON.stringify(response.headers),
      data: await parseData(response, response.headers, debug),
    };

    clearTimeout(abortTimeout);
    debug && console.warn(responseObject);
    return responseObject;
  } catch (error) {
    return {status: 503, statusText: 'Service Unavailable'};
  }
};

/**
     * Send an HTTP Request
     * @param {object} requestConfig - Request configuration which will be send.
     * @param {string} requestConfig.endpoint Endpoint formated as eg. '/token' - required.
     * @param {string} requestConfig.method Http request method - required.
     * @param {object} requestConfig.headers Http request headers.
     * @param {object} requestConfig.data Http request data.
     * @param {number} requestConfig.timeout Http request timeout in miliseconds.
     * @param {number} requestConfig.debug Turns on debug mode - set to 'True'.
     * @returns {object} An {status, statusText, headers, data} containing status and data from response.
  */
 const SendHTTPrequest = async (requestConfig) => {
    // Headers settings
    const url = API_ENDPOINT + requestConfig.endpoint;
  
    let allHeaders = {
      ...requestConfig.headers,
      Authorization: await getBearerToken()
    };
  
    const fetchConfig = {};
    fetchConfig.headers = allHeaders;
    fetchConfig.method = requestConfig.method;
  
    if(allHeaders['Content-Type'] === 'application/json'){
      const stringifiedJSON = JSON.stringify(requestConfig.data)
      fetchConfig.body = stringifiedJSON;
    } else {
      fetchConfig.body = requestConfig.data;
    }
  
    try {
      const responseObject = await fetchMethod(url, fetchConfig, requestConfig.timeout, requestConfig.debug);
      return responseObject;
    } catch (error) {
      return error;
    }
  };

  export  { SendHTTPrequest };
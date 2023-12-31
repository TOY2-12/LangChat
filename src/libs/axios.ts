import axios from 'axios';

export const publicApi = axios.create({
  baseURL: 'https://fastcampus-chat.net/',
  headers: {
    'content-type': 'application/json',
    serverId: `${process.env.REACT_APP_SERVER_ID}`,
  },
});

export const privateApi = axios.create({
  baseURL: 'https://fastcampus-chat.net/',
  headers: {
    'content-type': 'application/json',
    serverId: `${process.env.REACT_APP_SERVER_ID}`,
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
});

// 요청 시 interceptors
privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const newConig = config;
  newConig.headers.Authorization = `Bearer ${token}`;

  return newConig;
});

// 토큰을 함께보내는 privateApi에 interceptor를 적용합니다
privateApi.interceptors.response.use(
  // 200번대 응답이 올때 처리
  (response) => response,
  // 200번대 응답이 아닐 경우 처리
  async (error) => {
    const {
      config,
      response: { status },
    } = error;

    if (status === 401) {
      const originRequest = config;
      // if (msg === 'access token expired') {
      await axios({
        url: `https://fastcampus-chat.net/refresh`,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          serverId: `${process.env.REACT_APP_SERVER_ID}`,
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        data: {
          refreshToken: localStorage.getItem('refreshToken'),
        },
      }).then((res) => {
        localStorage.setItem('accessToken', res.data.accessToken);
        originRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return publicApi(originRequest);
      });
      // }
    } else if (status === 400 || status === 404 || status === 409) {
      // window.alert(msg);
      // eslint-disable-next-line no-console
      console.log('요청 실패');
    }
    return Promise.reject(error);
  },
);

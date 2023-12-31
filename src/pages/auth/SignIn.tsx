import React, { useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { privateApi, publicApi } from '../../libs/axios';
import { accessTokenState, userState } from '../../atoms';
import { db } from '../../firebaseSDK';
import { UserSimple } from '../../types/User';
import { userInfoConverter } from '../../libs/firestoreConverter';

interface ResponseValue {
  accessToken: string; // 사용자 접근 토큰
  refreshToken: string; // access token 발급용 토큰
}

function SignIn() {
  const navigate = useNavigate();
  const [userData, setUserData] = useRecoilState(userState);
  const [accessToken, setAccessTokenState] = useRecoilState(accessTokenState);
  const formik = useFormik({
    initialValues: {
      id: '',
      password: '',
    },
    onSubmit: async (values) => {
      try {
        const { id, password } = values;
        const res = await publicApi.post<ResponseValue>('login', {
          id,
          password,
        });

        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);

        privateApi.interceptors.request.use((config) => {
          const token = res.data.accessToken;
          const newConig = config;
          newConig.headers.Authorization = `Bearer ${token}`;

          return newConig;
        });
        const res2 = await privateApi.get<{ auth: boolean; user: UserSimple }>(
          'auth/me',
        );
        const { user } = res2.data;

        const userSn = await getDoc(
          doc(db, 'user', user.id).withConverter(userInfoConverter),
        );
        if (userSn.exists()) {
          const userData = userSn.data();
          const { image } = userData;
          if (image === '') {
            await updateDoc(doc(db, 'user', user.id), { image: user.picture });
          }
        }

        localStorage.setItem('user', JSON.stringify(user));
        setAccessTokenState(res.data.accessToken);
        setUserData(JSON.stringify(user));
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // axios에서 발생한 error
          if (error.code === 'ERR_BAD_REQUEST') {
            // eslint-disable-next-line no-console
            toast.error('아이디 혹은 비밀번호를 잘못 입력하셨습니다.');
          }
        }
      }
    },
  });

  useEffect(() => {
    if (accessToken) {
      // 유저 정보와 액세스 토큰이 있을때
      navigate('/home');
    }
  }, [accessToken, navigate]);

  return (
    <Container sx={{ height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80%',
        }}
      >
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={formik.handleSubmit}
        >
          <Typography variant="h4">로그인</Typography>
          <Typography color="text.secondary" variant="body1" sx={{ my: 3 }}>
            계정이 없으신가요? &nbsp;
            <MuiLink
              component={Link}
              to="/signup"
              underline="hover"
              variant="subtitle2"
            >
              회원가입
            </MuiLink>
          </Typography>
          <TextField
            fullWidth
            label="아이디"
            id="id"
            name="id"
            value={formik.values.id}
            onChange={formik.handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="비밀번호"
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            margin="normal"
          />
          <Button
            fullWidth
            type="submit"
            size="large"
            variant="contained"
            sx={{ mt: 3 }}
          >
            로그인
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default SignIn;

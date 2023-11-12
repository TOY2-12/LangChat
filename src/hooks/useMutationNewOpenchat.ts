/* eslint-disable no-console */
import React, { useCallback, useState } from 'react';
import { useFormik } from 'formik';
import { isAxiosError } from 'axios';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseSDK';
import { newChatValidationSchema } from '../utils/validateSchema';
import { privateApi } from '../libs/axios';
import dataUrlToFile from '../utils/dataUrltoFile';
import { ChatInfoConverter } from '../libs/firestoreChatConverter';

interface Chat {
  id: string;
  name: string;
  users: User[]; // 자신을 포함한 참가자들 정보
  isPrivate: boolean;
  latestMessage: Message | null;
  updatedAt: Date;
}

interface User {
  id: string;
  name: string;
  picture: string;
}
interface Message {
  id: string;
  text: string;
  userId: string;
  createAt: Date;
}
type ChatNewInfo = Omit<Chat, 'latestMessage'>;

interface OpenchatCreateProps {
  setSelectedId: (id: string | null) => void;
}

function useMutationNewOpenchat({ setSelectedId }: OpenchatCreateProps) {
  const [isOpenchatCreating, setIsOpenchatCreating] = useState(false);
  const [preview, setPreview] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [invitedUser, setInvitedUser] = useState<string[]>([]);
  const [hashtagError, setHashtagError] = useState(false);
  const [invitedError, setInvitedError] = useState(false);
  let image: string;

  /**
   * Step 1. 채팅방 만들기
   * Step 2. 방금 만든 채팅방 id 값을 받아온 후 firebase에 정보 저장
   * Step 2-1. 썸네일이 있으면 storage에 저장하고 firebase 정보에도 저장
   */
  const newOpenchat = async (
    values: { isPrivate: boolean; name: string },
    invitedUser: string[],
    hashtags: string[],
    preview: string,
  ) => {
    // 오픈 채팅 생성중임을 알리는 state
    setIsOpenchatCreating(true);
    try {
      // 채팅방 만들기
      const { data } = await privateApi.post<ChatNewInfo>('chat', {
        ...values,
        users: invitedUser,
      });
      // 파일이 있으면 업로드
      if (preview !== '') {
        const type = preview.split(';')[0].slice(5);
        const imageFile = await dataUrlToFile(preview, data.id, type);
        const storageRef = ref(storage, `chat/${data.id}`);
        const uploadRef = await uploadBytes(storageRef, imageFile, {
          contentType: type,
        }).then((snapshot) => snapshot.ref);
        image = await getDownloadURL(uploadRef);
      }
      // id를 가져와서 firebase에 해당 채팅방 해시태그, 섬네일 정보 저장
      const docRef = doc(db, 'openchat', data.id).withConverter(
        ChatInfoConverter,
      );
      await setDoc(docRef, {
        ...data,
        hashtags,
        image: image !== undefined ? image : '',
      });
    } catch (error) {
      // axios 에러가 발생하면 응답 객체 보여주기 (TODO: 추후 toast로 수정 필요)
      if (isAxiosError(error)) {
        console.log(error.response);
      } else if (error instanceof Error) {
        console.log(error.message);
      }
    } finally {
      // 오픈 채팅의 성공/실패 후 다시 false로 바꾸기
      setIsOpenchatCreating(false);
    }
  };

  // state 모두 초기화하는 함수
  const resetAll = useCallback(() => {
    setPreview('');
    setHashtags([]);
    setInvitedUser([]);
    setSelectedId(null);
    setHashtagError(false);
    setInvitedError(false);
  }, [setSelectedId]);

  const handleAutocompleteChange = (value: string[]) => {
    if (!value.length) {
      setHashtagError(true);
      return;
    }
    setHashtags(value);
    setHashtagError(false);
  };
  const handleUserSelectChange = (value: string[]) => {
    if (!value.length) {
      setInvitedError(true);
      return;
    }
    const invited = [...value];
    const invitedId = invited.map((user) => user.split('(id:')[1].slice(0, -1));
    setInvitedUser(invitedId);
    setInvitedError(false);
  };
  const formik = useFormik({
    initialValues: {
      isPrivate: false,
      name: '',
    },
    validationSchema: newChatValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      // autocomplete는 validation이 자동으로 안되어서 직접 validation을 추가
      if (
        !hashtags.length ||
        hashtagError ||
        !invitedUser.length ||
        invitedError
      ) {
        if (!hashtags.length || hashtagError) setHashtagError(true);
        if (!invitedUser.length || invitedError) setInvitedError(true);
        return;
      }

      // 채팅방 생성
      await newOpenchat(values, invitedUser, hashtags, preview);
      // 폼 정보, state 초기화
      resetForm();
      resetAll();
    },
    onReset: () => {
      resetAll();
    },
  });

  return {
    formik,
    preview,
    setPreview,
    handleAutocompleteChange,
    handleUserSelectChange,
    hashtagError,
    invitedError,
    isOpenchatCreating,
  };
}

export default useMutationNewOpenchat;

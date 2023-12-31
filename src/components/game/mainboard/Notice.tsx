import React from 'react';
import { Campaign } from '@mui/icons-material';
import styled from 'styled-components';

const NoticeWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Rules = styled.div`
  position: relative;
  margin-left: 20px;
  padding: 5px 20px;
  color: #fff;
  border-radius: 8px 10px 10px 10px;
  background-color: #f1faee;
  &::before {
    content: '';
    position: absolute;
    top: 72px;
    left: -14px;
    border-right: 15px solid #f1faee;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
`;
const Rule = styled.p`
  color: #000;
  font-size: 14px;
`;

export default function Notice() {
  return (
    <NoticeWrap>
      <Campaign sx={{ fontSize: 50 }} />
      <Rules>
        <Rule>1. 5초 안에 영어 끝말잇기를 하여 최고의 기록을 세워보세요.</Rule>
        <Rule>
          2. 같은 알파벳이 3번 이상 반복될 수 없고 최소 3글자 이상 최대 10글자
          이내로 작성되어야 합니다.
        </Rule>
        <Rule>3. 정답의 유무는 네이버 지식백과를 기준으로 합니다.</Rule>
        <Rule>4. 최고 갯수를 기준으로 랭킹을 나열합니다.</Rule>
      </Rules>
    </NoticeWrap>
  );
}

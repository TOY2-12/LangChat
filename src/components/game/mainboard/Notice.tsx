import { Campaign } from '@mui/icons-material';
import React, { useState } from 'react';
import styled from 'styled-components';

const NoticeWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Rules = styled.div<{ props: boolean }>`
  position: relative;
  margin-left: 20px;
  padding: 5px 20px;
  color: #fff;
  border-radius: 8px 10px 10px 10px;
  background-color: #f1faee;
  visibility: ${(props) => (props.props ? 'visible' : 'hidden')};
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
  const [openRule, setOpenRule] = useState(true);

  return (
    <NoticeWrap>
      <Campaign
        sx={{ fontSize: 50, cursor: 'pointer' }}
        onClick={() => {
          setOpenRule(!openRule);
        }}
      />
      <Rules props={openRule}>
        <Rule>1. 같은 알파벳이 3번 이상 반복될 수 없고 최소 3글자 이상 최대 10글자 이내로 작성되어야 합니다.</Rule>
        <Rule>2. 정답의 유무는 네이버 지식백과를 기준으로 합니다.</Rule>
        <Rule>3. 눈 아이콘을 클릭하여 이전 정답들을 확인할 수 있습니다.</Rule>
        <Rule>4. 맞힌 갯수를 기준으로 순위를 매깁니다.</Rule>
      </Rules>
    </NoticeWrap>
  );
}
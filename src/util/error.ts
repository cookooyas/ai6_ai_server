export const ERROR_MESSAGE = {
  NOT_FOUND: {
    // 404
    GENRE: '장르 정보를 찾을 수 없습니다.',
    SINGER: '가수 정보를 찾을 수 없습니다.',
    COOKIE: '쿠키 정보를 찾을 수 없습니다.',
    MUSIC: '곡 정보를 찾을 수 없습니다.',
    LIKE: '찜 정보를 찾을 수 없습니다.',
    ANSWER: '정답 영상 정보를 찾을 수 없습니다.',
    ANSWER_SHEET: '정답 관절 정보를 찾을 수 없습니다.',
    SCORE: '플레이 정보를 찾을 수 없습니다.',
    SCORE_DETAIL: '플레이 상세 정보를 찾을 수 없습니다.',
    USER: '유저 정보를 찾을 수 없습니다.',
    BODY: {
      NICKNAME: '닉네임이 입력되지 않았습니다.',
      EMAIL: '이메일이 입력되지 않았습니다.',
    },
  },
  CONFLICT: {
    // 409
    GENRE: '해당 장르 정보가 존재합니다.',
    SINGER: '해당 가수 정보가 존재합니다.',
    MUSIC: '해당 곡 정보가 존재합니다.',
    LIKE: '해당 찜 정보가 존재합니다.',
    USER: {
      NICKNAME: '해당 유저 닉네임이 존재합니다.',
    },
  },
  UNAUTHORIZED: {
    // 401
    USER_DELETED: '탈퇴한 사용자입니다.',
    PASSWORD: '비밀번호가 일치하지 않습니다.',
    LOGIN: '로그인에 실패했습니다.',
  },
  FORBIDDEN: {
    // 403
    IS_NOT_ADMIN: '관리자 권한이 필요합니다.',
    JOIN: '회원가입에 실패했습니다.',
  },
  BAD_REQUEST: {
    FILE: '파일이 존재하지 않습니다.',
  },
};

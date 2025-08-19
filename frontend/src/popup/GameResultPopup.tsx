import html2canvas from "html2canvas";

  export interface GameResult {
    top1: string;
    jg1: string;
    mid1: string;
    ad1: string;
    sup1: string;
    top2: string;
    jg2: string;
    mid2: string;
    ad2: string;
    sup2: string;
  }

export default function GameResultPopup({gameResult, handleCloseButtonClick}: {
  gameResult: GameResult;
  handleCloseButtonClick: () => void;
}) {


  function handleCaptureButtonClick() {
    const captureElement: HTMLElement | null = document.querySelector('.popup-body-box');

    if (!captureElement) {
      console.error('복사할 대상을 찾을 수 없습니다.');
      return;
    }

    html2canvas(captureElement).then(canvas => {
      // 1. 캔버스를 Blob 객체로 변환합니다.
      // 참고: canvas.toBlob은 Promise가 아닌 콜백 기반 함수입니다.
      // 따라서 이 함수 자체는 린터 경고의 원인이 아닙니다.
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Blob 생성에 실패했습니다.');
          return; // 여기서 에러가 나도 바깥쪽 catch에서는 잡을 수 없습니다.
        }

        // 2. Clipboard API를 사용하여 Blob을 클립보드에 씁니다.
        const item = new ClipboardItem({'image/png': blob});

        navigator.clipboard.write([item]).then(() => {
          alert('이미지가 클립보드에 복사되었습니다!');
        }).catch(err => {
          console.error('클립보드에 복사하는데 실패했습니다.', err);
          alert('이미지 복사에 실패했습니다. 브라우저 설정을 확인해주세요.');
        });
      }, 'image/png');
    })
      .catch(err => { // 👇 바로 이 부분입니다!
        // html2canvas 자체에서 에러가 발생했을 경우를 처리합니다.
        console.error('html2canvas 렌더링에 실패했습니다.', err);
        alert('이미지 생성에 실패했습니다.');
      });
  }

  return (
    <div className="popup-wrapper">
      <div className="popup">
        <div className="popup-title-box"/>
        <div className="popup-body-box">
          <div className="popup-body-box-player-result-box">
            <div className="popup-body-box-player-result-box-team-box left">
              <div className="popup-body-box-player-result-box-team-box-card left">
                <p>{gameResult.top1}</p>
              </div>
              <div className="popup-body-box-player-result-box-team-box-card left">
                <p>{gameResult.jg1}</p>
              </div>
              <div className="popup-body-box-player-result-box-team-box-card left">
                <p>{gameResult.mid1}</p>
              </div>
              <div className="popup-body-box-player-result-box-team-box-card left">
                <p>{gameResult.ad1}</p>
              </div>
              <div className="popup-body-box-player-result-box-team-box-card left">
                <p>{gameResult.sup1}</p>
              </div>
            </div>
            <div className="popup-body-box-player-result-box-role-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="49" viewBox="0 0 48 49" fill="none">
                <path d="M30.3158 30.6682L17.6842 30.6682L17.6842 17.8111L30.3158 17.8111L30.3158 30.6682Z" fill="white"
                      fillOpacity="0.15"/>
                <path
                  d="M42.5495 0.239678L3.50672e-06 0.239682L7.22652e-06 43.549L9.26316 34.1205L9.26316 9.23968L33.7074 9.23967L42.5495 0.239678Z"
                  fill="white" fillOpacity="0.15"/>
                <path
                  d="M14.9521 39.2397L38.7368 39.2397L38.7368 15.0302L48 5.60163L48 48.2397L6.11 48.2397L14.9521 39.2397Z"
                  fill="white" fillOpacity="0.15"/>
                <path
                  d="M42.5495 0.239678L3.50672e-06 0.239682L7.22652e-06 43.549L9.26316 34.1205L9.26316 9.23968L33.7074 9.23967L42.5495 0.239678Z"
                  fill="currentColor"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="55" viewBox="0 0 48 55" fill="none">
                <path
                  d="M27.7668 26.3176C28.8 28.3912 29.3453 31.2136 29.4888 32.3656L31.8565 26.7496C31.713 26.3176 31.5121 24.5896 31.8565 21.1336C32.2009 17.6776 36.4484 6.15758 38.5291 0.829583C36.7354 3.27758 32.7175 8.82158 30.9955 11.4136C29.2735 14.0056 26.4036 19.4056 25.1839 21.7816C25.6143 22.4296 26.7336 24.244 27.7668 26.3176Z"
                  fill="currentColor"/>
                <path
                  d="M34.87 42.5176C33.6646 43.5544 32.0717 45.3976 31.426 46.1896L31.2108 39.9256C31.426 39.0616 31.9856 36.9016 32.5022 35.1736C33.0188 33.4456 34.4395 29.7736 37.2377 24.8056C37.9552 23.7256 39.9928 21.004 41.5426 19.6216C43.0924 18.2392 45.6323 16.5976 48 15.3016C44.7713 18.9736 45.2018 18.5416 42.1883 23.9416C39.7354 28.3372 39.3184 35.2456 39.3901 39.2776C38.3856 39.9256 36.0753 41.4808 34.87 42.5176Z"
                  fill="currentColor"/>
                <path
                  d="M26.2601 38.8456C26.2601 47.14 24.8251 52.6696 24.1076 54.3976C18.5973 46.1032 11.4798 40.5736 8.60987 38.8456C8.39462 36.2536 7.74888 30.2488 6.88789 26.9656C6.02691 23.6824 1.93722 17.8216 0 15.3016C1.93722 16.1656 6.6296 18.628 9.90134 21.5656C13.1731 24.5032 15.426 29.1256 16.1435 31.0696C16.1435 29.0536 16.0143 23.8984 15.4978 19.4056C14.9812 14.9128 11.1211 4.86158 9.2556 0.397583C10.9058 2.91758 14.2063 6.87758 16.7892 11.4136C18.5666 14.5349 26.2601 28.4776 26.2601 38.8456Z"
                  fill="currentColor"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M0 0.209229H35.684L26.8419 9.02173H9.26316V26.5416L0 35.7738V0.209229Z" fill="white"
                      fillOpacity="0.15"/>
                <path d="M12.3419 47.2092H48V11.6704L38.7368 20.9026V38.3967H21.184L12.3419 47.2092Z" fill="white"
                      fillOpacity="0.15"/>
                <path d="M48 7.85962L8.51953 47.2092H0V39.5842L39.5068 0.209229H48V7.85962Z" fill="currentColor"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M17.6842 17.5725H30.3158V30.1618H17.6842V17.5725Z" fill="white" fillOpacity="0.15"/>
                <path d="M5.45045 47.3671H48V4.96004L38.7368 14.1922V38.5546H14.2926L5.45045 47.3671Z" fill="white"
                      fillOpacity="0.15"/>
                <path d="M33.0479 9.17963H9.26316V32.8847L0 42.1169V0.367126H41.89L33.0479 9.17963Z" fill="white"
                      fillOpacity="0.15"/>
                <path d="M5.45045 47.3671H48V4.96004L38.7368 14.1922V38.5546H14.2926L5.45045 47.3671Z"
                      fill="currentColor"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="41" viewBox="0 0 48 41" fill="none">
                <path
                  d="M22.2353 14.3847L23.8235 16.4899L25.5882 14.3847L29.8235 35.7882L23.8235 40.525L18.1765 35.7882L22.2353 14.3847Z"
                  fill="currentColor"/>
                <path
                  d="M30.8824 23.332L27.7059 13.1566L32.4706 8.41976L48 8.94608C47.2941 9.70631 45.4941 11.297 43.9412 12.2794C42.3882 13.2619 40.2353 14.3847 38.2941 14.5601H34.2353L38.2941 20.3496L30.8824 23.332Z"
                  fill="currentColor"/>
                <path d="M23.8235 11.9285L16.5882 3.68292L18.1765 0.525024H29.8235L31.2353 3.68292L23.8235 11.9285Z"
                      fill="currentColor"/>
                <path
                  d="M19.7647 13.1566L15.5294 8.94608H0C0.588235 9.41391 1.05882 10.8759 4.58823 12.6303C7.31992 13.9881 9.58823 14.6186 10.0588 14.5601H13.5882L9.52941 20.3496L17.1176 23.332L19.7647 13.1566Z"
                  fill="currentColor"/>
              </svg>
            </div>
            <div className="popup-body-box-player-result-box-team-box right">
              <div className="popup-body-box-player-result-box-team-box-card right">
                <p>{gameResult.top2}</p>
              </div>
              <div className="popup-body-box-player-result-box-team-box-card right">
                <p>{gameResult.jg2}</p>
              </div>
              <div className="popup-body-box-player-result-box-team-box-card right">
                <p>{gameResult.mid2}</p>
              </div>
              <div className="popup-body-box-player-result-box-team-box-card right">
                <p>{gameResult.ad2}</p>
              </div>
              <div className="popup-body-box-player-result-box-team-box-card right">
                <p>{gameResult.sup2}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="popup-footer">
          <div className="popup-footer-button-box">
            <button type="button" className="popup-footer-button-subtle" onClick={handleCloseButtonClick}>
              닫기
            </button>
            <button type="button" className="popup-footer-button-primary" onClick={handleCaptureButtonClick}>
              이미지 복사
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
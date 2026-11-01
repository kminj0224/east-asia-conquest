# 동아시아 콘퀘스트

Terha Conquest v1.11.94의 정복 엔진·게임 UI·경제·생산·전투·수송·연구·저장 기능을 기반으로 한 독립 Android 전략 게임입니다.

## APK

[최신 릴리스](../../releases/latest)에서 `East-Asia-Conquest-v1.0.0.apk`를 받으세요. 앱 이름은 **동아시아 콘퀘스트**, Android 패키지는 `com.eastasia.conquest`입니다. 테르하 원본과 함께 설치할 수 있습니다. Android 8 이상, 가로 화면을 사용합니다.

## 국가와 지도

| 국가 | 색 | 도시 수 |
|---|---|---:|
| 대한민국 | 초록 | 23 |
| 중화인민공화국 | 빨강 | 66 |
| 일본 | 회색 | 52 |
| 조선민주주의인민공화국 | 노랑 | 14 |
| 중화민국 | 파랑 | 22 |
| 러시아 | 청록 | 12 |
| 몽골 | 갈색 | 11 |
| 베트남 | 보라 | 13 |

- 86×80 기본 육각 격자와 주변 해역. 육지는 원본의 핵심 지도 3,561개와 확장 지역 111개를 합친 **3,672타일**로 고정합니다.
- 지도 범위: 동경 105–147°, 북위 20–54°. 러시아·중국·몽골·베트남은 지도 범위 안의 지역을 사용합니다.
- 대한민국은 서울·6개 광역시·세종·각 도청 소재지·제주·울릉도·독도와 강릉·포항·목포·서귀포를 포함합니다. 일본은 47개 도도부현청 소재지, 중화민국은 22개 시·현 중심지를 포함합니다.
- 후지산·태백산맥·소백산맥·백두산·한라산·일본 알프스·다싱안링·친링·시호테알린 등 산·산맥 31개, 한강·낙동강·금강·압록강·두만강·황허·창장·아무르강 등 주요 하천 24개와 대표 호수를 반영합니다.
- 해안선은 Natural Earth 국가 경계를, 주요 하천은 Natural Earth 강 중심선과 명시된 지형 좌표를 사용합니다. 작은 섬과 밀집 도시는 전략 지도 해상도에 맞게 타일 위치를 조정합니다.
- 산악 그림이 있는 타일은 산악(3), 강줄기와 대응하는 타일은 하천(4)입니다. 숲은 지형 2입니다. 강은 지상군이 통과하는 육지 타일이며 해군은 들어가지 못합니다. 비도시 하천 진입 비용은 일반 지상군 2, 기갑 3, 항공기는 지형을 무시합니다. 산악은 기존 엔진의 이동·방어 규칙을 사용합니다.
- 모든 국가는 서로 **중립**으로 시작합니다. 외교 창에서 선전포고합니다.
- 국가 전용 특수유닛은 없습니다. 일반 보병·기갑·포병·항공·해군, 도시 건설·연구·보급 규칙은 공유 엔진을 사용합니다. 유닛과 도시는 국가색 도형으로 표시하며 국기를 붙입니다.
- 바다·숲·산 그림은 원본의 `ocean-material.png`, `trial-forest-*.png`, `trial-mountain-*.png`를 재사용합니다. 게임 UI와 음악·효과음은 원본을 사용합니다.

## 빌드와 검증

Python 3, Java 17, Node 20 이상, ffmpeg가 필요합니다.

```sh
npm ci
python3 -m pip install shapely
python3 tools/east-asia/generate_map.py
node tools/east-asia/render_assets.cjs
python3 tools/prepare_operation_music.py
npm test
python3 qa/verify-native.py
python3 build.py
python3 qa/east-asia-apk.py
```

결과: `deliverables/East-Asia-Conquest-v1.0.0.apk`와 SHA-256 체크섬. 회귀 검증은 실제 Canvas 렌더링과 시뮬레이션 DOM을 사용하며, 물리 Android 기기 테스트는 아닙니다.

## 원본과 지리 자료

- 엔진/UI/음원/미술 원본: [kminj0224/terha-conquest](https://github.com/kminj0224/terha-conquest), 커밋 `4c968ba6d5d8a0397038de58612548341df48f8d`.
- 해안선: [datasets/geo-countries](https://github.com/datasets/geo-countries), Natural Earth.
- 강: [Natural Earth](https://github.com/nvkelso/natural-earth-vector), `ne_10m_rivers_lake_centerlines`.
- 국기: [flag-icons](https://github.com/lipis/flag-icons), MIT.

지도와 국명·색상·외교는 게임 시나리오 데이터입니다. 저장은 이 게임 전용 공간에 기록됩니다.

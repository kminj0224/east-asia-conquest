북한 소총수·유탄수·중기관총병·대전차보병의 원본 WebP 7장을 적용한 **v1.2.8**입니다. [변경 사항](docs/releases/v1.2.8.md).

중국 소총수·유탄수·대전차보병·중기관총반 WebP 이미지를 적용한 **v1.2.7**입니다. [변경 사항](docs/releases/v1.2.7.md).

1안의 현대 도시 일러스트 L1~L5와 고층 수도·국가별 랜드마크를 적용한 **v1.2.6**입니다. 베이징은 자금성을 사용합니다. [변경 사항](docs/releases/v1.2.6.md).

일본 유탄수·대전차보병·중기관총반 이미지 추가 및 소총수 이미지 교체 **v1.2.5**입니다. [변경 사항](docs/releases/v1.2.5.md).

한국군 일반 전차의 이전 축소를 되돌린 뒤 6%, 나머지 모든 국가의 전차·경전차·정예전차를 10% 확대한 **v1.2.4**입니다. 원본 PNG와 지도 경계 수정은 유지합니다. [변경 사항](docs/releases/v1.2.4.md).



한국·일본 전차/정예전차 이미지를 최신 첨부본으로 교체하고, **차체 기준으로 타일 양끝보다 각각 4px 크게** 맞춘 v1.2.1입니다. [APK 릴리스](https://github.com/kminj0224/east-asia-conquest/releases/tag/v1.2.1). 포신과 투명 여백은 크기 기준에서 제외하며, 반전·반동·총구 섬광·피격 위치가 같은 배치 좌표를 사용합니다.

한국·일본 소총수/전차/정예전차 이미지 및 테르하 원본 전투 효과를 추가한 **v1.2.0**입니다. [APK 릴리스](https://github.com/kminj0224/east-asia-conquest/releases/tag/v1.2.0). 원본 PNG 8개는 `game/assets/eastasia-*.png`, 연결 지침은 `art/east-asia-units/README.md`에 있습니다. 나머지 병종과 도시는 기존 도형 외형을 유지합니다.

# 동아시아 콘퀘스트

[최신 APK 릴리스](../../releases/latest) · Android 8 이상 · 가로 화면 · 앱 ID `com.eastasia.conquest`

Terha Conquest v1.11.94의 게임 엔진·UI와 **원본 자연 지도 제작·영토색 합성·화면 캐시 경로**를 사용하는 동아시아 정복 게임입니다. 테르하 원본과 함께 설치할 수 있습니다.

## v1.1.2 지도 전면 수정

v1.0.0의 육각형 채색 지도와 문자 도형 표식을 제거했습니다. 원본의 중립색 고해상도 지도, 부드러운 해안선과 잔파도, 연결된 산·숲, 강의 샘플링과 수면 표현, 지면·수목·산악의 소속 마스크, 가까움/중간/전체 지도 해상도와 80 MiB 캐시를 그대로 사용합니다. 평소에는 육각형 격자를 그리지 않으며, 행동·선택 표시는 엔진의 실제 타일 좌표에 맞춰 표시합니다. 지형 이름을 지도에 덧쓰지 않습니다.

유닛은 이미지 모듈 적용 전의 실제 테르하 도형 렌더러를 사용합니다. 병사·전차·장갑차·차량화보병·박격포·견인포·자주포·로켓포·항공기·군함의 외형을 그립니다. 도시는 원본 도형 건물 렌더러를 사용합니다. 특수유닛은 제외합니다.

## 지도와 국가

| 국가 | 색조 | 육지 타일 | 도시 |
|---|---|---:|---:|
| 대한민국 | 낮은 채도의 초록 | 151 | 23 |
| 중화인민공화국 | 낮은 채도의 빨강 | 2438 | 34 |
| 일본 | 회색 | 588 | 52 |
| 조선민주주의인민공화국 | 낮은 채도의 노랑 | 197 | 14 |
| 중화민국 | 낮은 채도의 파랑 | 87 | 22 |
| 러시아 | 청록 | 211 | 3 |

총 육지 **3,672타일**, 99×122 기본 격자와 주변 해역, 148개 도시입니다. 동경 116–146°·북위 21–46°에 초점을 맞춰 러시아 대부분과 중국 내륙을 잘랐습니다. optional 국가인 몽골·베트남은 이 지도 범위 밖이므로 국가 선택에 나오지 않습니다.

대한민국은 서울·광역시·세종·도청 소재지와 제주·울릉도·독도 등을, 일본은 47개 도도부현청 소재지를, 중화민국은 22개 시·현 중심지를 포함합니다. 모든 도시 사이 거리는 최소 두 타일 단계입니다. 한국과 일본의 육지는 이전 판의 약 세 배 이상입니다.

산·산맥과 강은 실제 지형 좌표를 기준으로 타일에 등록합니다. 만주 평야는 평야로 유지하고 숲은 산맥·구릉의 띠를 따라 배치합니다. 모든 국가는 서로 중립으로 시작합니다. 기존 전투·경제·생산·연구·수송·보급 규칙과 UI를 사용하며, 하천은 항해할 수 없는 지상 통과 타일입니다.

## 빌드

Python 3 + shapely/numpy, Java 17, Node 20 이상과 ffmpeg가 필요합니다.

```sh
npm ci
python3 tools/east-asia/generate_map.py
node tools/east-asia/export_geography.cjs
node tools/bake-aligned-map.cjs
node tools/build-map-lods.cjs
node tools/east-asia/render_assets.cjs
python3 tools/prepare_operation_music.py
npm test
node qa/east-asia-atlas.cjs
python3 qa/verify-native.py
python3 build.py
python3 qa/east-asia-apk.py
```

실제 Chromium 검증은 Playwright와 Chromium 설치 후 `node qa/east-asia-browser.cjs`로 실행합니다. 결과 APK는 `deliverables/East-Asia-Conquest-v1.1.2.apk`입니다. 지도 배치가 달라져 v1.0.0의 작전 저장과 v1.1.2 작전 저장은 분리됩니다. 설정과 앱 설치 ID는 유지합니다.

지도 제작 지침은 [art/README.md](art/README.md), 수정 설명은 [docs/native-map-rework.md](docs/native-map-rework.md)에 있습니다. 물리 Android 기기 테스트는 별도로 필요합니다.

## 원본

- 엔진·UI·미술·음원·지도 합성: [kminj0224/terha-conquest](https://github.com/kminj0224/terha-conquest), `4c968ba6d5d8a0397038de58612548341df48f8d`.
- 지리 자료: [Natural Earth](https://github.com/nvkelso/natural-earth-vector), [geo-countries](https://github.com/datasets/geo-countries).
- 국기: [flag-icons](https://github.com/lipis/flag-icons), MIT.

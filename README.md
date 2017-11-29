# zigmap API Server

## Installation

다음 명령어를 통해 프로젝트 파일을 가져옵니다. 또는 [Github repository](https://github.com/NoteSquare/zigmap-api.git)에서 zip 파일을 다운로드 할 수 있습니다. 

```bash
git clone https://github.com/NoteSquare/zigmap-api.git
```

다음 명령어를 통해 의존 모듈을 설치합니다. 

```bash
npm install
```

zigmap API Server를 실행하기 위해서 Firebase cloud functions, Neo4j, Docker를 설치해야 합니다. 

[Firebase cloud functions](https://firebase.google.com/docs/functions/) 공식 문서를 참고하여 [Firebase 환경을 설정](https://firebase.google.com/docs/admin/setup?authuser=0)합니다. 

최단 경로를 조회하기 위해서 [Neo4j Graph Database](https://neo4j.com/)가 필요합니다. 

[Docker image](https://neo4j.com/developer/docker/)를 사용하여 설치 및 실행 할 수 있습니다. 
Docker image를 사용하기 위해서 Docker가 필요합니다. [Docker 공식 문서](https://www.docker.com/)를 참고하여 다운로드 및 설치할 수 있습니다. 

Docker image를 사용하는 경우 다음 명령어로 Neo4j 서버를 실행합니다. 

```bash
docker run \
    --publish=7474:7474 --publish=7687:7687 \
    --volume=$HOME/neo4j/data:/data \
    --volume=$HOME/neo4j/logs:/logs \
    neo4j
```

/config/neo4j.json 파일을 통해 username, password, host 정보를 지정합니다. 

## Usage

local 서버에서 Firebase cloud functions 실행

```bash
firebase serve --only functions
```

Firebase cloud functions 서버로 배포

```bash
firebase deploy --only functions
```

## API 

URI | Method | Description
--- | ------ | -----------
/directions | POST | 최단 경로 검색 결과를 보여줍니다. `(not implemented)`

### 최단 경로 탐색
- uri : /directions
- method : POST
- request
    - body
        ```json
        {
            "source" : "출발지 waypoint id",
            "destination" : "목적지 waypoint id"
        }
        ```
- response
    - 405 : Method not Allowed
        ```json
        Method not Allowed
        ```

    - 412 : Precondition Failed
        ```json
        Source, destination is required
        ```

    - 500 : Internal Server Error
        ```json
        Error message : string
        ```

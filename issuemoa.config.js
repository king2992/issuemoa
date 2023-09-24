module.exports = {
  apps: [{
    script: "server.js",
    instances: 4,
    exec_mode: "cluster", // cluster 모드로 어플리케이션을 구동시킨다.
    autorestart: true,
  }]
}
import express from "express";
import axios from "axios";

const app = express();
const PORT = 7860;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/proxy", async (req, res) => {
  try {
    const targetUrl = "https://manifest.googlevideo.com/api/manifest/hls_variant/expire/1761307282/ei/Mhb7aMCdF_uLvdIPoOa46Q0/ip/102.36.149.177/id/srJg6ZIPmvU.122/source/yt_live_broadcast/requiressl/yes/xpc/EgVo2aDSNQ%3D%3D/tx/51539853/txs/51539853%2C51539854%2C51539855/hfr/1/maxh/4320/playlist_duration/30/manifest_duration/30/maudio/1/siu/1/bui/AdEuB5R6GKGj9yYlpYJeCcL3Q53XHOugTjqfTVgdH8fRDQQqEIvbvmd9a5NWF_PQLVKE_XfN0Q/spc/6b0G_EP_u2y5xOHuI8w0GtAbixptr8wfZToqr7m5cgf1BCZ-GJwf/vprv/1/go/1/rqh/5/pacing/0/nvgoi/1/ncsapi/1/keepalive/yes/fexp/51355912%2C51552689%2C51565115%2C51565681%2C51580968/dover/11/itag/0/playlist_type/DVR/sparams/expire%2Cei%2Cip%2Cid%2Csource%2Crequiressl%2Cxpc%2Ctx%2Ctxs%2Chfr%2Cmaxh%2Cplaylist_duration%2Cmanifest_duration%2Cmaudio%2Csiu%2Cbui%2Cspc%2Cvprv%2Cgo%2Crqh%2Citag%2Cplaylist_type/sig/AJfQdSswRQIhALvVFJo9NVRdgt4p1MVWywPUeYsVYrVecRCR06-bgKkiAiBsOOr40hO4bipJlRd2vAbwqQQAEKFy5AV01YsiXr6Nww%3D%3D/file/index.m3u8";

    const response = await axios.get(targetUrl, {
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          "Referer": "https://www.youtube.com/",
          "Origin": "https://www.youtube.com/"
          
      },
    });

    // Set the same content type as the source (HLS manifest)
    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res); // stream it to the client
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).send("Proxy request failed");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
});

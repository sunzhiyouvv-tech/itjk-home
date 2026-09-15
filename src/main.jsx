import React from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const cards=[['🧰 IT极客工具箱','开发者效率工具集合','https://t.itjk.com'],['📄 文档工具箱','快速完成工作','https://doc.itjk.com'],['✏️ ITJK Draw','流程图、架构图、在线白板','https://draw.itjk.com']];
function App(){return <main><header><div className="logo">ITJK<span>.com</span></div><nav>Tools　Docs　Draw　About</nav></header><section className="hero"><h1>IT 极客<br/>开源工具与效率平台</h1><p>保持好奇，继续构建</p><button>探索工具</button></section><section className="grid">{cards.map(c=><a href={c[2]}><h2>{c[0]}</h2><p>{c[1]}</p></a>)}</section><section className="tags">AI　 Cloud　 Code　 Open Source</section><footer>© 2026 ITJK.com</footer></main>}
createRoot(document.getElementById('root')).render(<App/>);
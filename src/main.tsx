import React from 'react';
import ReactDOM from 'react-dom/client';

function App(){
 return (
  <div style={{fontFamily:'Arial',padding:'2rem'}}>
    <h1>Mylo Concept Lab</h1>
    <p>Machine Learning Interactive Learning Portal</p>
    <ul>
      <li>Foundations</li>
      <li>Regression</li>
      <li>Classification</li>
      <li>Clustering</li>
      <li>PCA</li>
      <li>Model Evaluation</li>
    </ul>
    <p>Part 1 scaffold.</p>
  </div>
 )
}
ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);

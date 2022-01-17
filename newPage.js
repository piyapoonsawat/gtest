var fs = require("fs");
var root =
  "/Users/piyapoonsawat/Desktop/Skote_React_v3.2.0/Admin-Redux-Staterkit";

var pageName;

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("What is your pageName ? ", function (pn) {
  pageName = pn;
  rl.question(
    "What are your data array? (e.g. productCatalogues,productDetail)",
    function (dts) {
      rl.question(
        "What are your redux actions? (e.g. login,logout, register_user)",
        function (acs) {
          genPage(pageName);
          genData(dts);
          genRedux(acs);

          rl.close();
        }
      );
    }
  );
});

rl.on("close", function () {
  console.log("\nBYE BYE !!!");
});

function w(fileName, str) {
  fs.appendFile(
    `${root}/src/pages/${pageName}/${fileName}`,
    `${str}\n`,
    function (err) {
      if (err) throw err;
      console.log("Saved!");
    }
  );
}

function genPage() {
  fs.mkdir(`${root}/src/pages/${pageName}`, { recursive: true }, err => {
    if (err) throw err;
  });

  w(
    "index.js",
    `
  import React, { Component } from "react";
  import Metatag from "components/Metatag"
  import Breadcrumbs from "components/Common/Breadcrumb";
  import { Container } from "reactstrap";
  
  class ${pageName} extends Component {
    render() {
      return (
        <React.Fragment>
          <div className="page-content">
            <Metatag title="${pageName}" />
            <Container fluid>
              <Breadcrumbs title={"${pageName}"} breadcrumbItem={"${pageName}"} />
              <h4>Content Here</h4>
            </Container>
          </div>
        </React.Fragment>
      );
    }
  }
  export default ${pageName};

  // manually add to routes/index.js
  //import ${pageName} from "../pages/${pageName}"
  //{ path: "/${pageName.toLowerCase()}", component: ${pageName} },

  // manually add to store/actions.js
  // export * from "../pages/${pageName}/redux/actions"

  // manually add to store/reducers.js
  // import ${pageName} from "..pages/${pageName}/redux/reducer"
  // and manually add to combineReducers
  // ${pageName}

  // manually add to store/sagas
  // import ${pageName}Saga from "..pages/redux/reducer/saga"
  // manually add to rootSaga
  // fork(${pageName}Saga),
  `
  );
}

function genRedux(acs) {
  const actions = acs.split(",");
  fs.mkdir(`${root}/src/pages/${pageName}/redux`, { recursive: true }, err => {
    if (err) throw err;
  });

  var acTypeStr = "";
  // Generate Action Types
  for (var i = 0; i < actions.length; i++) {
    var actiu = actions[i].toUpperCase();
    acTypeStr += `export const ${actiu} = "${actions[i]}"\n`;
    acTypeStr += `export const ${actiu}_SUCCESS = "${actions[i]}Success"\n`;
    acTypeStr += `export const ${actiu}_FAIL = "${actions[i]}Fail"\n`;
  }
  w("redux/actionTypes.js", acTypeStr);

  var actStr1 = "";
  for (var i = 0; i < actions.length; i++) {
    const actiu = actions[i].toUpperCase();
    var s1 = `${actiu},${actiu}_SUCCESS,${actiu}_FAIL`;
    if (i === 0) actStr1 += `import {`;
    actStr1 += s1;
    if (i !== actions.length - 1) actStr1 += ",";
    if (i === actions.length - 1) actStr1 += '} from "./actionsTypes"';
  }
  w("redux/actions.js", actStr1);

  var actStr2 = "";
  for (var i = 0; i < actions.length; i++) {
    actStr2 += `
         export const ${actions[i]} = submittedData => {
            return {
              type: ${actions[i].toUpperCase()},
              payload: { submittedData },
            }
          }
          
          export const ${actions[i]}Success = data => {
            return {
              type: ${actions[i].toUpperCase()}_SUCCESS,
              payload: data,
            }
          }
          
          export const ${actions[i]}Fail = error => {
            return {
              type: ${actions[i].toUpperCase()}_FAIL,
              payload: error,
            }
          }         
         `;
  }

  w("redux/actions.js", actStr2);

  var redStr1 = "";
  for (var i = 0; i < actions.length; i++) {
    var s1 = `${actions[i].toUpperCase()},${actions[
      i
    ].toUpperCase()}_SUCCESS,${actions[i].toUpperCase()}_FAIL`;
    if (i === 0) actStr1 += `import {`;
    actStr1 += s1;
    if (i !== actions.length - 1) actStr1 += ",";
    if (i === actions.length - 1) actStr1 += '} from "./actionsTypes"\n';
  }

  redStr1 += `
  const initialState = {
    x1: null,
    x2: "",
    x3:[],
    x4:{},
    loading: false,
    success: "",
    error: ""
  }`;
  // console.log(redStr1);
  w("redux/reducer.js", redStr1);

  var redStr2 = "";
  redStr2 += `
  const ${pageName} = (state = initialState, action) => {
    switch (action.type) {`;

  for (var i = 0; i < actions.length; i++) {
    redStr2 += `
      case ${actions[i].toUpperCase()}:
        state = {
          ...state,
          // some satage (e.g. message : action.payload)
        }
        break
      case ${actions[i].toUpperCase()}_SUCCESS:
        state = {
          ...state,
          // some satage (e.g. message : action.payload)
        }
        break
      case ${actions[i].toUpperCase()}_FAIL:
         state = {
          ...state,
          // some satage (e.g. message : action.payload)
        }
        break
    `;
  }

  redStr2 += `
      default:
        state = { ...state }
        break
    }
    return state
  }
  export default ${pageName}
  `;

  w("redux/reducer.js", redStr2);

  var sgStr = "";

  sgStr += `import { takeEvery, put, call, takeLatest } from "redux-saga/effects"
  import { ${acs.toUpperCase()} } from "./actionTypes"
  import { getFirebaseBackend } from "../../../helpers/firebase_helper" 
  \n`;

  sgStr += `  import { `;
  for (var i = 0; i < actions.length; i++) {
    const act = actions[i];
    sgStr += `${act}Success, ${act}Fail ${i !== actions.length - 1 ? "," : ""}`;
  }
  sgStr += `} from "./actions";\n`;

  sgStr += `  const fireBaseBackend = getFirebaseBackend()`;

  for (var i = 0; i < actions.length; i++) {
    const act = actions[i];
    sgStr += ` 
    function* ${act}({ payload: { user, history} }) {
      try {
        const response = yield call(
          fireBaseBackend.${act},
          user.email,
          user.password
        )
        // localStorage.setItem("authUser", JSON.stringify(response))
        yield put(${act}Success(response))
        // history.push(history.location.state?.from || "/dashboard")
      } catch (error) {
        yield put(${act}Fail(error))
      }
    }\n`;
  }

  sgStr += `function* allSaga() {\n`;
  for (var i = 0; i < actions.length; i++) {
    const act = actions[i];
    sgStr += `yield takeEvery(${act.toUpperCase()}, ${act})\n`;
  }

  sgStr += `}\n`;

  sgStr += `export default allSaga`;

  w("redux/sage.js", sgStr);
}

function genData(dt) {
  const data = dt.split(",");
  console.log(data);
  data.forEach(d => {
    w(
      "data.js",
      `
  const ${d}= [
    {
      id: 1,
      title: ${d}Title,
      type: "bg-success",
    },
  ];`
    );
  });

  w("data.js", `export {${dt}}`);
}

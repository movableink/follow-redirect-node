module.exports = function log(msg, header = null){
  // silence is golden in prod
  if(process.env.NODE_ENV === 'production'){
    return;
  }
  header ? console.log(`--- ${header} ----`) : console.log(" ");
  console.log(msg);
  console.log(" ");
};
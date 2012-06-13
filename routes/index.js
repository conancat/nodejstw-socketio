
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'NodeJS Party Taiwan 9 Socket.io Demo' })
};
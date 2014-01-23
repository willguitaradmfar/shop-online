//---------------------------------------------------------------//
var schedule = require('node-schedule');
//---------------------------------------------------------------//

var mail = require("nodemailer").mail;

module.exports = function(config, db, query, redisClient) {
    
    var sendMailAdministrator = function(obj){
        mail({
            from: "JOMOW <admnistrator@jomow.com.br>", // sender address
            to: "willguitaradmfar@gmail.com", // list of receivers
            subject: "Notificação JOMOW", // Subject line
            text: obj.text,//"Hello world", // plaintext body
            html: obj.html//"<b>Hello world</b>" // html body
        });
        console.log('Enviando email para administrador');
    }
    
    var indexProdutoSolr = function (produto, cb) {
        var doc = {};
        doc.id = produto._id;
        for(var i in produto){
            doc[i+'_t'] = JSON.stringify(produto[i]);
        }
        
        solrClient.add(doc, function(err,obj){
           if(err){
              console.log("error solr : "+err);
              redisClient.rpush('produto::create', JSON.stringify(produto));
           }else{
              io.sockets.emit('produto::indexSolr', produto);
              console.log('Solr response:' + obj);
              if(cb)cb();
           }
        });
    }
    
    var atualizaProdutoSolr = function (produto, cb) {
         var doc = {};
        doc.id = produto._id;
        for(var i in produto){
            doc[i+'_t'] = JSON.stringify(produto[i]);
        }
        deletaProdutoSolr(produto, function () {
            solrClient.add(doc, function(err,obj){
               if(err){
                  console.log("error solr : "+err);
                  redisClient.rpush('produto::update', JSON.stringify(produto));
               }else{
                   io.sockets.emit('produto::updateSolr', produto);
                  console.log('Solr response:' + obj);
                    if(cb)cb();
               }
            });
        })   
    }
    
    var deletaProdutoSolr = function (produto, cb) {
        solrClient.deleteByID(produto._id,function(err,obj){
           if(err){
                   console.log("error solr : "+err);
                   redisClient.rpush('produto::remove', JSON.stringify(produto));
           }else{
               io.sockets.emit('produto::deletaSolr', produto);
                if(cb)cb();       
           }
        });
    }
    
    var queueLPOP = function (fila, cb) {
        redisClient.lpop(fila, function (err, obj) {
            if(obj){
                cb(JSON.parse(obj));
                queueLPOP(fila, cb);
            }
        });
    }
    
	var j = schedule.scheduleJob('* * * * *', function(){
        console.log("## PROCESSANDO FILA ##");
        
        queueLPOP("produto::create", indexProdutoSolr);
        
        queueLPOP("produto::update", atualizaProdutoSolr);
        
        queueLPOP("produto::remove", deletaProdutoSolr);
        
        queueLPOP("system::mail::administrator", sendMailAdministrator);
       
    });
    
    
};
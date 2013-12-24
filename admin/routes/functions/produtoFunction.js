module.exports = function(app, db) {
	return {
		getProdutos: function(callback) {
			db.Produto.find(function(err, produtos) {
			    if(err)console.error(err);
				if (produtos && produtos.length != 0) {
					callback(produtos);
				} else {
					callback(null);
				}
			});
		},
		
		getProdutosPaginate: function(perPage, page, callback) {
			db.Produto.find(function(err, produtos) {
			    if(err)console.error(err);
				if (produtos && produtos.length != 0) {
					callback(produtos);
				} else {
					callback(null);
				}
			}).limit((perPage));
		},
		
		getProdutoById: function(id, callback) {
			db.Produto.findOne({
				_id: id
			}, function(err, produto) {
				if (produto) {
					callback(produto);
				} else {
					callback(produto);
				}
			});
		},
		getProdutoByQuery: function(query, callback) {
			db.Produto.findOne(query, function(err, produto) {
				if (produto) {
					callback(produto);
				} else {
					callback(produto);
				}
			});
		}

	};
};
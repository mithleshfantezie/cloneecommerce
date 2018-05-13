





$(function() {


  $('#search').keyup(function(){
    var search_term = $(this).val();




    $.ajax({
      method: 'POST',
      url: '/api/search',
      data: {
        search_term
      },
      dataType: 'json',
      success: function(json) {
        console.log(json);
        var cate = json.categories.map(function(hit) {
          return hit;
        });
        var data = json.search.hits.hits.map(function(hit) {
          return hit;
        });
        if(data.length === 0 ) {
          $('#searchResult').empty();
          var html = "";
          html += '<p> Sorry No Result Found.</p>';
          $('#searchResult').append(html);

        }else {
          $('#searchResult').empty();
          for(var i=0; i<data.length;i++){

            for(var j=0; j<cate.length; j++)
            { if(data[i]._source.category == cate[j]._id)
              {


            var html = "";
            html += '<div class="col-md-4">';
            html += '<a class="card-link" href="/product/'+ data[i]._id +'/">';
            html += '<div class="img-thumbnail">';
            html += '<img class="card-img-top" src="'+ data[i]._source.image + '" alt="">';
            html += '<div class="caption">';
            html += '<br />';
            html += '<button type="button" class="btn btn-primary">';
            html +=  data[i]._source.name;
            html += '</button><br>';
            html += '  <span class="badge badge-pill badge-success">'+ cate[j].name  +'</span>';
            html += '<p></p>';
            html += '<p><h5><span class="badge badge-secondary">$' + data[i]._source.price + '</span></h5></p>';
            html += '  </div>';
            html += '</div>';
            html += '</a>';
            html += '<br />';
            html += '</div>';
            html += '<br />';
            console.log(data);

          $('#searchResult').append(html);
        }
      }

        }

        }
      },
      error: function(error) {
      console.log(err);
      }



  });
});
});


$(document).on('click', '#plus', function(e) {
  e.preventDefault();
  var priceValue = parseFloat($('#priceValue').val());
  var quantity = parseInt($('#quantity').val());

  priceValue += parseFloat($('#priceHidden').val());
  quantity += 1;

  $('#quantity').val(quantity);
  $('#priceValue').val(priceValue.toFixed(2));
  $('#total').html(quantity);
});

$(document).on('click', '#minus', function(e) {
  e.preventDefault();
  var priceValue = parseFloat($('#priceValue').val());
  var quantity = parseInt($('#quantity').val());
  if(quantity === 1 ){
    return;
  }

  priceValue -= parseFloat($('#priceHidden').val());
  quantity -= 1;

  $('#quantity').val(quantity);
  $('#priceValue').val(priceValue.toFixed(2));
  $('#total').html(quantity);
});

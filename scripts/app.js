'use strict';

let app = {};

app.idGenerator = ( function () {
  let id = 1;
  return {
    next: function () {
      const newId = id;
      id++;
      return newId;
    }
  };
}() )

app.randomIntegers = function ( sum ) {
  if ( Math.random() > 0.9 ) {
    return [];
  }
  let value = sum;
  let parts = [];
  while ( value > 0 ) {
    const part = Math.floor( Math.random() * value );
    if ( part > 0 ) {
      value -= part;
      parts.push( part );
    } else {
      parts.push( value );
      value = 0;
    }
  }
  return parts;
}

app.node = function ( company, profit ) {
  return {
    id: app.idGenerator.next(),
    company: company,
    profit: profit,
    parent: null,
    childs: [],
    child: function ( childNode ) {
      childNode.parent = this;
      this.childs.push( childNode );
    },
    jsonFormat: function ( pretty ) {
      return JSON.stringify( this, function ( k, v ) {
        if ( k === 'parent' ) {
          if ( !v ) {
            return null;
          }
          return v.id;
        } else {
          return v;
        }
      }, pretty ? 2 : 0 );
    }
  };
}

app.createNewTree = function ( mainComapny, overallProfit ) {
  const mainCompany = app.node( mainComapny, overallProfit );
  const layers = [ [ mainCompany ] ];
  let layer = [];
  let nodes = [ mainCompany ];
  for ( let i = 0; i < 5; i++ ) {
    const previousLayer = layers[ i ];
    for ( let j = 0; j < previousLayer.length; j++ ) {
      const node = previousLayer[ j ];
      const parts = app.randomIntegers( node.profit );
      for ( var k = 0; k < parts.length; k++ ) {
        const childNode = app.node( 'node-' + Math.floor( 1000000 * Math.random() ), parts[ k ] );
        node.child( childNode );
        layer.push( childNode );
        nodes.push( childNode );
      }
    }
    if ( layer.length === 0 ) {
      break;
    } else {
      layers.push( layer );
      layer = [];
    }
  }
  return {
    mainCompany: mainCompany,
    toSqlInsertStatement: function () {
      let sql = '';
      for ( let z = 0; z < nodes.length; z++ ) {
        sql += 'INSERT INTO COMPANY (COMPANY_ID, NAME, PROFIT, PARENT) ' + ' VALUES (' + nodes[ z ].id + ', ' + nodes[ z ].company + ', ' + nodes[ z ].profit + ', ' + ( nodes[ z ].parent ? nodes[ z ].parent.id : null ) + ')\n'
      }
      return sql;
    }
  };
}

let companyTree = app.createNewTree( 'root', 20000 );
const codeHolder = document.querySelector( '.language-json' );
codeHolder.innerHTML = companyTree.mainCompany.jsonFormat( true );
new ClipboardJS( '#copy-button' );
const newModelButton = document.getElementById( 'new-model-button' );
const changeIndentationButton = document.getElementById( 'indentation-toggle-button' );
let indented = true;
const showSqlButton = document.getElementById( 'sql-button' );

newModelButton.addEventListener( 'click', function () {
  companyTree = app.createNewTree( 'root', 20000 );
  codeHolder.innerHTML = companyTree.mainCompany.jsonFormat( indented );
} );

changeIndentationButton.addEventListener( 'click', function () {
  if ( indented ) {
    codeHolder.innerHTML = companyTree.mainCompany.jsonFormat();
    changeIndentationButton.innerText = 'JSON';
  } else {
    codeHolder.innerHTML = companyTree.mainCompany.jsonFormat( true );
    changeIndentationButton.innerText = 'Compressed JSON';
  }
  indented = !indented;
} )

showSqlButton.addEventListener( 'click', function () {
  codeHolder.innerHTML = companyTree.toSqlInsertStatement();
} );

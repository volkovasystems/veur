
const path = require( "path" );
const veur = require( "./veur.js" );

veur( {
	"clientPath": "test/client",
	"viewPath": "/view"
} ).listen( 8000 );

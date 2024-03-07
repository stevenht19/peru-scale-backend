import express from 'express'
import morgan from 'morgan';
import fileUpload from 'express-fileupload'
import productosRoutes from './routes/productos.routes.js'
import loginRoutes from './routes/login.routes.js'
import productsRoutes from './routes/products.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import products_categoriesRoutes from './routes/products_categories.routes.js'
import cotizacionRoute from './routes/cotizacion.route.js'
import users_managementRoutes from './routes/users_management.routes.js'
import my_accountRoutes from './routes/my_account.routes.js'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

//Initialization
const app = express();
//const __dirname = dirname(fileURLToPath(import.meta.url));

//Settings
app.set('port', process.env.PORT || 3000);
/*
app.set('views', join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: join(app.get('views'), 'layouts'),
    partialsDir: join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');*/

//Middlewares
app.use(cors())
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))

//Routes
/*
app.get('/', (req, res)=>{
    res.render('index')
})*/

app.use(productosRoutes);
app.use(loginRoutes);

app.use(loginRoutes);
app.use('/productos', productsRoutes);
app.use('/cotizaciones', cotizacionRoute)
app.use(categoriesRoutes);
app.use(products_categoriesRoutes);
app.use('/admin', users_managementRoutes);
app.use('/client_register', my_accountRoutes);


//Public files
//app.use(express.static(join(__dirname, 'public')));

//Run Server
app.listen(app.get('port'), () =>
    console.log('Server listening on port', app.get('port')));
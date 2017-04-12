<?php
/**
 * Declare Scripts
 */
if ( ! function_exists('war_style_registrar')):
    function war_style_registrar(){
        /***** Register CSS FIRST *****/
        wp_register_style('war_bootstrap_core_css', get_template_directory_uri().'/inc/lib/bootstrap.min.css' );
        wp_register_style('war_ionicons', get_template_directory_uri().'/inc/lib/ionicons.min.css');
        wp_register_style('war_tether_css', get_template_directory_uri().'/inc/lib/tether.min.css');
        wp_register_style('war_colorpicker_css', get_template_directory_uri().'/inc/lib/colorpicker.min.css');
        wp_register_style('war_style', get_stylesheet_uri(), array('war_bootstrap_core_css') );
        if(is_child_theme()) wp_register_style('war_parent_style', get_template_directory_uri() . '/style.css', array('war_bootstrap_core_css'));
        /***** Enqueue them *****/
        wp_enqueue_style('war_bootstrap_core_css' );
        wp_enqueue_style('war_ionicons');
        wp_enqueue_style('war_tether_css');
        wp_enqueue_style('war_colorpicker_css');
        if(is_child_theme()) wp_enqueue_style('war_parent_style');
        wp_enqueue_style('war_style'); // Site Style (Always Load At The End)
    }
endif;
add_action('wp_enqueue_scripts', 'war_style_registrar');

if ( ! function_exists( 'war_get_scripts' ) ):
    function war_get_scripts(){
        /***** Top Parent Scripts *****/
        war_script_registrar( war_top_parent_scripts() );
        /***** Child Scripts *****/
        if( function_exists( 'war_child_scripts' ) ) war_script_registrar( war_child_scripts() );
        /***** Bottom Parent Scripts *****/
        war_script_registrar( war_bottom_parent_scripts() );


    }
endif;
add_action('wp_enqueue_scripts', 'war_get_scripts');

if ( ! function_exists( 'war_top_parent_scripts' ) ) :
    function war_top_parent_scripts() {
        return array(
            'war_tether_js' => array(
                'url' => get_template_directory_uri().'/inc/lib/tether.min.js',
                'depends' => array('jquery')
            ),
            'war_lodash_js' => array(
                'url' => get_template_directory_uri().'/inc/lib/lodash.min.js',
                'depends' => array('jquery')
            ),
            'war_bootstrap_core_js' => array(
                'url' => get_template_directory_uri().'/inc/lib/bootstrap.min.js',
                'depends' => array('jquery','war_tether_js')
            ),
            'war_angular_js' => array(
                'url' => get_template_directory_uri().'/inc/lib/angular.min.js',
                'depends' => array('jquery')
            ),
            'war_ui_router_js' => array(
                'url' => get_template_directory_uri().'/inc/lib/angular-ui-router.min.js',
                'depends' => array('war_angular_js')
            ),
            'war_colorpicker_js' => array(
                'url' => get_template_directory_uri().'/inc/lib/bootstrap-colorpicker-module.min.js',
                'depends' => array('war_angular_js')
            ),
            'war_wysiwyg_js' => array(
                'url' => get_template_directory_uri().'/inc/lib/wysiwyg.js',
                'depends' => array('war_angular_js')
            ),
            // 'war_pre_child_js' => [
            //     'url' => get_template_directory_uri() . '/inc/angular/war-pre-child.js',
            //     'depends' => [ 'war_angular_js' ]
            // ]
            'war_extend_init' => array(
                'url' => get_template_directory_uri().'/inc/angular/source/WarExtendInit.js',
                'depends' => array('war_angular_js')
            ),
            'war_extend_routes' => array(
                'url' => get_template_directory_uri().'/inc/angular/source/WarRoutes.js'
            )
        );
    }
endif;

if ( ! function_exists( 'war_bottom_parent_scripts' ) ) :
    function war_bottom_parent_scripts() {
        return array(
            // 'war_post_child_js' => [
            //     'url' => get_template_directory_uri() . '/inc/angular/war-post-child.js',
            //     'depends' => [ 'war_pre_child_js' ]
            // ]
            'war_extend_configs' => array(
                'url' => get_template_directory_uri().'/inc/angular/source/WarConfigs.js',
                'depends' => 'war_extend_routes'
            ),
            'war_extend_factories' => array(
                'url' => get_template_directory_uri().'/inc/angular/source/WarFactories.js',
            ),
            'war_extend_controllers' => array(
                'url' => get_template_directory_uri().'/inc/angular/source/WarControllers.js',
            ),
            'war_extend_directives' => array(
                'url' => get_template_directory_uri().'/inc/angular/source/WarDirectives.js',
            )
        );
    }
endif;

if( ! function_exists( 'war_script_registrar' ) ):
    function war_script_registrar( $scripts = array() ){
        foreach($scripts as $s=>$d){
            $depends = (isset($d["depends"]) && is_array($d["depends"])) ? $d["depends"] : array('war_extend_init');
            wp_register_script($s,$d["url"],$depends,null,true);
            wp_enqueue_script($s,$s);
        }
    }
endif;


/************************************************************************
* Register Main Menu
************************************************************************/
if ( ! function_exists( 'war_register_main_menu' ) ) :
    function war_register_main_menu() {
        register_nav_menu('header',__('Header Menu'));
    }
endif; // END war_register_main_menu
add_action('init', 'war_register_main_menu');

/**********************************************************************
* Strip the Version tag from CSS and JS Scripts
**********************************************************************/
if ( ! function_exists( 'war_remove_cssjs_ver' ) ) :
    function war_remove_cssjs_ver( $src ) {
        if( strpos( $src, '?ver=' ) )
            $src = remove_query_arg( 'ver', $src );
        return $src;
    }
endif;
add_filter( 'style_loader_src', 'war_remove_cssjs_ver', 10, 2 );
add_filter( 'script_loader_src', 'war_remove_cssjs_ver', 10, 2 );

/**********************************************************************
* Prevent Admin and Login default redirects
**********************************************************************/
if(! function_exists( 'war_admin_login_redirect_remove' ) ) :
    function war_admin_login_redirect_remove(){
        $uri = untrailingslashit($_SERVER['REQUEST_URI']);
        $login_url = site_url('login','relative');
        $admin_url = site_url('admin','relative');
        if($uri === $login_url || $uri === $admin_url){
            remove_action( 'template_redirect', 'wp_redirect_admin_locations', 1000 );
        }
    }
endif;
add_action('template_redirect','war_admin_login_redirect_remove');

/**********************************************************************
* Actions and Filters to remove
**********************************************************************/
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_filter('template_redirect', 'redirect_canonical');

/**********************************************************************
* Check for 404 and set to 200 if need be
**********************************************************************/
if(! function_exists( 'war_force_resolve' ) ) :
    function war_force_resolve(){
        $uri = $_SERVER['REQUEST_URI'];
        if(preg_match('/^\/admin\/.*/',$uri)){
            status_header(200);
        }
    }
    add_action( 'wp', 'war_force_resolve' );
endif;

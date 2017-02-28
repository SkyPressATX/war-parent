<?php get_header(); ?>

<div id="main" ng-app="$warModule" class="d-flex flex-column">
    <header class="pb-3" ui-view="header"></header>
    <div id="body" class="container" ui-view="body"></div>
    <footer class="pt-3" ui-view="footer"></footer>
</div> <!-- end #main -->

<?php get_footer();

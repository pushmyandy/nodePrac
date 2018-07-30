<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <style>
        body {
            margin: 20px;
        }
        a {
            font-size: 20px;
            text-decoration: none;
        }
    </style>
</head>
<body>
{{#each files}}
    <a href="{{../dir}}/{{file}}">[{{icon}}]{{file}}</a>
{{/each}}
</body>
</html>
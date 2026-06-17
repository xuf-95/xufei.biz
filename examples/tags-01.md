---
tags:
---
```dataview
TABLE WITHOUT ID tag AS Tag, length(rows) AS Count
FROM ""
FLATTEN file.etags AS tag
GROUP BY tag
SORT length(rows) DESC
```



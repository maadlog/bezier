# HTML5 and Canvas 2D
## Bézier Generator

Bézier curves generator and viewer, made in HTML5 canvas.

### Points of Intrest
#### Bézier curves
The generator recursively creates Bézier curves given the anchor points.
These curves have many applications and are often used in path tracing and animation.
( [Explanation Here](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) )

``` javascript
BezierGeneral.prototype.update = function(elapsed_ms)
{  
	this.bezier_a.update(elapsed_ms);
	this.bezier_b.update(elapsed_ms);

	this.time = this.bezier_a.time;
	this.length = this.bezier_a.length;

	this.line = new Line(this.bezier_a.point,this.bezier_b.point,this.color);
	this.point = new Vector(this.bezier_b.point.x - this.bezier_a.point.x,this.bezier_b.point.y - this.bezier_a.point.y).Dot(this.bezier_a.time / this.bezier_a.length).Plus(this.bezier_a.point);

 [...]
};
```
The recursive definition stands on a simple principle, an N-order Bezier curve consists of a linear Bézier curve (N = 1) between the points of two other Bézier curves of order N-1.

This allows for potentialy infinite anchor points for a path and also provides easy scaling and transforming, since to modify a path, a transformation on the anchor points is enough to regenerate the entire curve.

This non optimized version caps arround 18 anchor points without showing lines or 12 points with full rendering

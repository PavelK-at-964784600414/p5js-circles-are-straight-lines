class ArcTile {
    constructor(i, j, tileSize) {
      this.i = i;
      this.j = j;
      this.xPos = i * tileSize;
      this.yPos = j * tileSize;
      this.tileSize = tileSize;
      this.biggestRadius = sqrt(sq(tileSize) / 2) * 0.973; // Max radius for the arcs
    }
  
    display(offset) {
      // Display blue and orange arcs with separate color schemes
      this.displayArcs(offset, color(0, 255, 255), 0.973, 0.1); // Blue scheme
      this.displayArcs(offset, color(229, 255, 0), 0.923, 0.1); // Orange scheme
  
      // Redraw first arcs after overlay
      stroke(0, 255 * 0.973, 255);
      this.redrawFirstArcs(offset, this.biggestRadius * 0.973);
    }
  
    displayArcs(offset, baseColor, initialRatio, decrement) {
      let ratio = initialRatio;
      for (let i = 0; i < 10; i++) {
        let r = this.biggestRadius * ratio;
        stroke(baseColor.levels[0], baseColor.levels[1] * ratio, baseColor.levels[2]);
        let intersections = this.calculateIntersections(offset, r);
  
        if (!intersections.horizon) {
          this.drawPartialArcs(offset, r, i);
        } else {
          this.drawFullArcs(offset, intersections, r);
        }
  
        ratio -= decrement;
      }
    }
  
    calculateIntersections(offset, r) {
      const radiusOffset = r + offset * sqrt(2);
      const tileRadiusOffset = this.biggestRadius + offset * sqrt(2);
  
      return {
        circle: this.findIntersectionPointsTwoCircles(
          this.xPos - offset, this.yPos - offset, radiusOffset,
          this.xPos - offset, this.yPos + this.tileSize + offset, tileRadiusOffset
        ),
        horizon: this.findCircleLineIntersections(
          createVector(this.xPos - offset, this.yPos - offset), radiusOffset,
          createVector(this.xPos, this.yPos), createVector(this.xPos + this.tileSize, this.yPos)
        ),
        vertical: this.findCircleLineIntersections(
          createVector(this.xPos - offset, this.yPos - offset), radiusOffset,
          createVector(this.xPos, this.yPos), createVector(this.xPos, this.yPos + this.tileSize)
        )
      };
    }
  
    drawPartialArcs(offset, r) {
      const radius = r * 2 + offset * sqrt(2) * 2;
      const positions = [
        [-offset, -offset], 
        [this.tileSize + offset, -offset], 
        [-offset, this.tileSize + offset], 
        [this.tileSize + offset, this.tileSize + offset]
      ];
  
      for (let pos of positions) {
        arc(this.xPos + pos[0], this.yPos + pos[1], radius, radius, PI, PI * 0.99);
      }
    }
  
    drawFullArcs(offset, intersections, r) {
      let startAngle, endAngle;
      const tileOffset = this.tileSize + offset;
      const radius = r * 2 + offset * sqrt(2) * 2;
  
      try {
        if (intersections.circle && intersections.circle[0].x > this.xPos) {
          endAngle = atan2(this.yPos - offset - intersections.circle[0].y, this.xPos - offset - intersections.circle[0].x);
          startAngle = atan2(this.yPos - offset - intersections.horizon.y, this.xPos - offset - intersections.horizon.x);
        } else {
          endAngle = atan2(this.yPos - offset - intersections.vertical.y, this.xPos - offset - intersections.vertical.x);
          startAngle = atan2(this.yPos - offset - intersections.horizon.y, this.xPos - offset - intersections.horizon.x);
        }
  
        startAngle = this.adjustStartAngle(startAngle);
        this.drawArcsByPosition(offset, radius, startAngle, endAngle);
      } catch {
        return;
      }
    }
  
    adjustStartAngle(startAngle) {
      return startAngle > 0 ? -PI + (-PI + startAngle) : startAngle;
    }
  
    drawArcsByPosition(offset, radius, startAngle, endAngle) {
      const tileOffset = this.tileSize + offset;
      const positions = [
        [this.xPos - offset, this.yPos - offset],
        [this.xPos + tileOffset, this.yPos - offset],
        [this.xPos + tileOffset, this.yPos + tileOffset],
        [this.xPos - offset, this.yPos + tileOffset]
      ];
  
      for (let k = 0; k < 4; k++) {
        const angles = (this.i + this.j) % 2 === 0
          ? [startAngle + PI + k * 0.5 * PI, endAngle + PI + k * 0.5 * PI]
          : [-endAngle + 1.5 * PI + k * 0.5 * PI, -startAngle + 1.5 * PI + k * 0.5 * PI];
  
        arc(positions[k][0], positions[k][1], radius, radius, angles[0], angles[1]);
      }
    }
  
    redrawFirstArcs(offset, r) {
      const intersections = this.calculateIntersections(offset, r);
      this.drawFullArcs(offset, intersections, r);
    }
  
    findIntersectionPointsTwoCircles(x1, y1, r1, x2, y2, r2) {
      const d = dist(x1, y1, x2, y2);
      if (d > r1 + r2 || d < abs(r1 - r2)) return null;
  
      const a = (sq(r1) - sq(r2) + sq(d)) / (2 * d);
      const h = sqrt(sq(r1) - sq(a));
      const x3 = x1 + a * (x2 - x1) / d;
      const y3 = y1 + a * (y2 - y1) / d;
  
      return [
        createVector(x3 + h * (y2 - y1) / d, y3 - h * (x2 - x1) / d),
        createVector(x3 - h * (y2 - y1) / d, y3 + h * (x2 - x1) / d)
      ];
    }
  
    findCircleLineIntersections(circleCenter, radius, linePointA, linePointB) {
      const deltaX = linePointB.x - linePointA.x;
      const deltaY = linePointB.y - linePointA.y;
      const a = sq(deltaX) + sq(deltaY);
      const b = 2 * (deltaX * (linePointA.x - circleCenter.x) + deltaY * (linePointA.y - circleCenter.y));
      const c = sq(linePointA.x - circleCenter.x) + sq(linePointA.y - circleCenter.y) - sq(radius);
      const discriminant = sq(b) - 4 * a * c;
  
      if (discriminant < 0) return null;
  
      const t = (-b + sqrt(discriminant)) / (2 * a);
      return createVector(linePointA.x + t * deltaX, linePointA.y + t * deltaY);
    }
  
    dotedArc(x, y, w, h, start, stop, spacing) {
      let arcLength = abs(stop - start);
      let steps = arcLength / spacing;
  
      for (let i = 0; i < steps; i++) {
        let angle = lerp(start, stop, i / steps);
        let xpos = x + (w / 2) * cos(angle);
        let ypos = y + (h / 2) * sin(angle);
        ellipse(xpos, ypos, 5, 5);
      }
    }
  }
  
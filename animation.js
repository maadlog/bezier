TranslationAnimation = function (init_x,init_y,target_x,target_y) {
    this.init_x = init_x;
    this.init_y = init_y;
    this.target_x = target_x;
    this.target_y = target_y;

    this.time = 0;
    this.enabled = false;
    this.transform = Matrix.Identity;

    this.velocity = Vector.Zero;
    this.acceleration = Vector.Zero;
}

TranslationAnimation.prototype.Start = function () {
    this.enabled = true;
    this.time = 0;

    this.velocity = Vector.VersorFrom((this.target_x-this.init_x) ,(this.target_y-this.init_y)).Dot(250);
    this.acceleration = Vector.Zero;
}

TranslationAnimation.prototype.Reset = function () {
    this.transform = Matrix.Identity;
}

TranslationAnimation.prototype.update = function (elapsed_ms) {
    if (!this.enabled) return;
    this.time += (elapsed_ms/1000);

    var x = this.init_x + this.time*this.velocity.x + (1/2)*this.acceleration.x*(this.time**2)
    var y = this.init_y + this.time*this.velocity.y + (1/2)*this.acceleration.y*(this.time**2)

    var dif = Math.abs(this.target_x - x + this.target_y - y );
    if(dif < 10) {
        this.enabled = false;
        return;
    }

    this.transform = Matrix.Translation(x,y);
}

TranslationAnimation.prototype.GetValue = function () {
    return this.transform;
}

TranslationAnimation.prototype.Play = function()
{
    this.Reset();
    this.Start();
};
# Generated by Django 3.1.7 on 2021-05-11 18:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('play', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='private',
            field=models.BooleanField(default=False),
        ),
    ]
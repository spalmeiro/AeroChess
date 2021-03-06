# Generated by Django 3.1.7 on 2021-05-06 10:03

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('owner_side', models.CharField(default='white', max_length=10)),
                ('owner_online', models.BooleanField(default=False)),
                ('adversary_online', models.BooleanField(default=False)),
                ('fen', models.CharField(blank=True, max_length=92, null=True)),
                ('pgn', models.TextField(blank=True, null=True)),
                ('status', models.IntegerField(choices=[(1, 'Game Created. Waiting for adversary'), (2, 'Game Started'), (3, 'Game Ended')], default=1)),
                ('winner', models.TextField(blank=True, null=True)),
                ('details', models.TextField(blank=True, null=True)),
                ('adversary', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='adversary', to=settings.AUTH_USER_MODEL)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
